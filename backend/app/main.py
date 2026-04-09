"""
Crop Health Monitoring System — FastAPI Backend
-----------------------------------------------
Entry point. Loads the model once at startup, then serves predictions.

Run locally:
    uvicorn backend.app.main:app --reload --port 8000
"""

import os
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import MODEL_PATH
from app.predict import preprocess_image, run_inference, get_treatment
from app.gradcam import compute_gradcam, heatmap_to_base64
from app.database import init_db, save_diagnosis, get_history, search_history, clear_all_history
from app.gemini_service import get_enhanced_treatment

# ── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Crop Health Monitoring API",
    description="AI-powered crop disease detection for Ethiopian farmers.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict to your domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the React build (production only)
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

# ── Model loading ─────────────────────────────────────────────────────────────

model: tf.keras.Model | None = None

@app.on_event("startup")
def load_model():
    global model
    init_db()  # Initialize database
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")
    else:
        print(f"⚠️  Model file not found at '{MODEL_PATH}'. Run ml/train.py first.")

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
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded. Please train the model first (run ml/train.py).",
        )

    try:
        file_bytes = await file.read()
        pil_image, img_array = preprocess_image(file_bytes)
        class_name, confidence, class_idx = run_inference(model, img_array)
        
        # Check if confidence is too low (unknown crop)
        CONFIDENCE_THRESHOLD = 0.75  # 75% minimum confidence
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "class": "Unknown",
                "confidence": round(confidence, 4),
                "treatment": (
                    f"⚠️ Low Confidence Detection ({confidence*100:.1f}%)\n\n"
                    f"The model detected '{class_name}' but with very low confidence. "
                    f"This image might be:\n"
                    f"• A crop not trained in the system (only Maize, Potato, Tomato are supported)\n"
                    f"• Poor image quality (blurry, dark, or unclear)\n"
                    f"• Not a leaf image\n\n"
                    f"Please upload a clear photo of Maize, Potato, or Tomato leaves."
                ),
                "enhanced_treatment": None,
                "heatmap": heatmap_to_base64(pil_image, compute_gradcam(model, img_array, class_idx)),
            }
        
        treatment = get_treatment(class_name)
        heatmap = compute_gradcam(model, img_array, class_idx)
        heatmap_b64 = heatmap_to_base64(pil_image, heatmap)
        
        # Save to database
        crop_name = class_name.split("_")[0]
        disease_name = "_".join(class_name.split("_")[1:])
        save_diagnosis(crop_name, disease_name, confidence)
        
        # Get enhanced treatment from Gemini
        enhanced = get_enhanced_treatment(crop_name, disease_name, treatment)

        return {
            "class": class_name,
            "confidence": round(confidence, 4),
            "treatment": treatment,
            "enhanced_treatment": enhanced,
            "heatmap": heatmap_b64,
        }

    except Exception as exc:
        import traceback
        traceback.print_exc()  # Print full error to console
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
