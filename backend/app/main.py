"""
Crop Health Monitoring System — FastAPI Backend
Entry point. Loads the model once at startup, then serves predictions.

Run locally:
    uvicorn backend.app.main:app --reload --port 8000
"""

import os
import asyncio
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.concurrency import run_in_threadpool

from app.config import MODEL_PATH, IMG_SIZE
from app.predict import preprocess_image, run_inference, get_treatment
from app.gradcam import compute_gradcam, heatmap_to_base64
from app.database import init_db, save_diagnosis, get_history, search_history, clear_all_history
from app.gemini_service import get_enhanced_treatment

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Crop Health Monitoring API",
    description="AI powered crop disease detection for Ethiopian farmers.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Serve the React build (production only)
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

# ── Model loading ─────────────────────────────────────────────────────────────

model: tf.keras.Model | None = None

@app.on_event("startup")
def load_model():
    global model
    init_db()
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print(f"Model loaded from {MODEL_PATH}")

        # Warm up the model — eliminates 20s delay on first real prediction
        print("Warming up model...")
        h, w = IMG_SIZE
        dummy = np.zeros((1, h, w, 3), dtype=np.float32)
        model.predict(dummy, verbose=0)
        print("Model warmed up ✓ — first prediction will now be fast.")

        gpus = tf.config.list_physical_devices('GPU')
        if not gpus:
            print("No GPU detected — running on CPU.")
        else:
            print(f"GPU detected: {gpus}")
    else:
        print(f"Model file not found at '{MODEL_PATH}'. Run ml/train.py first.")

# ── Helper ────────────────────────────────────────────────────────────────────

def _parse_class_name(class_name: str) -> tuple[str, str]:
    """Split class name into crop and disease parts."""
    sep = "___" if "___" in class_name else "_"
    parts = class_name.split(sep, 1)
    crop_name = parts[0]
    disease_name = parts[1] if len(parts) > 1 else "Unknown"
    return crop_name, disease_name

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {
        "status": "running",
        "model_loaded": model is not None,
    }


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    """
    Accept a leaf image, run inference, and return:
      - detected disease class
      - confidence score
      - treatment advice (basic + Gemini-enhanced)
      - Grad-CAM heatmap overlay (base64 JPEG)
    """
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded. Please train the model first (run ml/train.py).",
        )

    try:
        file_bytes = await file.read()

        # Run heavy CPU work in threadpool so it doesn't block the event loop
        pil_image, img_array = await run_in_threadpool(preprocess_image, file_bytes)
        class_name, confidence, class_idx = await run_in_threadpool(run_inference, model, img_array)

        # Unknown class
        if class_name == "Unknown":
            return {
                "class": "Unknown",
                "confidence": round(confidence, 4),
                "treatment": (
                    "Model Configuration Error\n\n"
                    "The model predicted a class that doesn't exist in the system. "
                    "Please retrain the model or check the CLASS_NAMES configuration."
                ),
                "enhanced_treatment": None,
                "heatmap": None,
            }

        crop_name, disease_name = _parse_class_name(class_name)

        # Low confidence
        CONFIDENCE_THRESHOLD = 0.75
        if confidence < CONFIDENCE_THRESHOLD:
            save_diagnosis(crop_name, disease_name, confidence)
            print(f"Low confidence saved: {crop_name} | {disease_name} | {confidence:.2%}")

            # Still compute heatmap in threadpool
            heatmap_b64 = await run_in_threadpool(
                lambda: heatmap_to_base64(pil_image, compute_gradcam(model, img_array, class_idx))
            )
            return {
                "class": class_name,
                "confidence": round(confidence, 4),
                "treatment": (
                    f"Low Confidence Detection ({confidence*100:.1f}%)\n\n"
                    f"The model detected '{class_name}' but with very low confidence. "
                    f"This image might be:\n"
                    f"• Poor image quality (blurry, dark, or unclear)\n"
                    f"• Not a leaf image\n\n"
                    f"Supported crops: Apple, Blueberry, Cherry, Coffee, Corn, Enset, Grape, "
                    f"Maize, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato.\n"
                    f"Please upload a clear photo of a supported crop leaf."
                ),
                "enhanced_treatment": None,
                "heatmap": heatmap_b64,
                "low_confidence": True,
            }

        # Run Grad-CAM and Gemini concurrently to save time
        treatment = get_treatment(class_name)

        gradcam_task = run_in_threadpool(
            lambda: heatmap_to_base64(pil_image, compute_gradcam(model, img_array, class_idx))
        )
        gemini_task = run_in_threadpool(
            get_enhanced_treatment, crop_name, disease_name, treatment
        )

        # Run both at the same time
        heatmap_b64, enhanced = await asyncio.gather(gradcam_task, gemini_task)

        save_diagnosis(crop_name, disease_name, confidence)
        print(f"Saved to DB: {crop_name} | {disease_name} | {confidence:.2%}")

        return {
            "class": class_name,
            "confidence": round(confidence, 4),
            "treatment": treatment,
            "enhanced_treatment": enhanced,
            "heatmap": heatmap_b64,
        }

    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/history")
def get_diagnosis_history(limit: int = 50):
    """Get recent diagnosis history."""
    return {"history": get_history(limit)}


@app.get("/api/search")
def search_diagnosis(query: str):
    """Search diagnosis history by crop or disease name."""
    return {"results": search_history(query)}


@app.delete("/api/history")
def delete_all_history():
    """Clear all diagnosis history."""
    deleted = clear_all_history()
    return {"message": f"Deleted {deleted} records", "deleted": deleted}