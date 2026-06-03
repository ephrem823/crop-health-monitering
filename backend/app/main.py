"""
Crop Health Monitoring System — FastAPI Backend
"""

import os
os.environ['TF_USE_LEGACY_KERAS'] = '0'
import asyncio
from concurrent.futures import ThreadPoolExecutor
import tensorflow as tf
import keras
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

_executor = ThreadPoolExecutor(max_workers=2)

# Set determinism for reproducible predictions
keras.utils.set_random_seed(42)

from app.config import MODEL_PATH
from app.predict import preprocess_image, run_inference, get_treatment
from app.gradcam import compute_gradcam, heatmap_to_base64
from app.database import init_db, save_diagnosis, get_history, search_history, clear_all_history
from app.gemini_service import get_enhanced_treatment

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
CONFIDENCE_THRESHOLD = 0.75

app = FastAPI(
    title="Crop Health Monitoring API",
    description="AI-powered crop disease detection for Ethiopian farmers.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")


class ModelState:
    model = None


@app.on_event("startup")
def load_model():
    init_db()
    if os.path.exists(MODEL_PATH):
        ModelState.model = keras.models.load_model(MODEL_PATH, compile=False)
        print(f"✅ Model loaded from {MODEL_PATH}")
    else:
        print(f"⚠️  Model not found at '{MODEL_PATH}'.")


@app.get("/api/health")
def health_check():
    return {"status": "running", "model_loaded": ModelState.model is not None}


def _low_confidence_response(class_name: str, confidence: float, img_array: np.ndarray):
    heatmap = compute_gradcam(ModelState.model, img_array, 0)
    from PIL import Image
    import io
    return {
        "class": "Unknown",
        "confidence": round(confidence, 4),
        "treatment": (
            f"⚠️ Low Confidence Detection ({confidence*100:.1f}%)\n\n"
            f"Detected '{class_name}' but confidence is too low.\n"
            "Please upload a clear photo of a supported crop leaf."
        ),
        "enhanced_treatment": None,
        "heatmap": None,
    }


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    if ModelState.model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")

    try:
        pil_image, img_array = preprocess_image(file_bytes)
        class_name, confidence, class_idx = run_inference(ModelState.model, img_array)

        if class_name == "Unknown":
            return {
                "class": "Unknown",
                "confidence": round(confidence, 4),
                "treatment": "Model configuration error. Please retrain the model.",
                "enhanced_treatment": None,
                "heatmap": None,
            }

        if confidence < CONFIDENCE_THRESHOLD:
            parts = class_name.split("___") if "___" in class_name else class_name.split("_")
            save_diagnosis(parts[0], "_".join(parts[1:]) or "Unknown", confidence)
            heatmap_b64 = heatmap_to_base64(pil_image, compute_gradcam(ModelState.model, img_array, class_idx))
            return {
                "class": "Unknown",
                "confidence": round(confidence, 4),
                "treatment": (
                    f"⚠️ Low Confidence ({confidence*100:.1f}%)\n\n"
                    f"Detected '{class_name}' with low confidence.\n"
                    "Please upload a clear photo of a supported crop leaf."
                ),
                "enhanced_treatment": None,
                "heatmap": heatmap_b64,
            }

        treatment = get_treatment(class_name)

        parts = class_name.split("___") if "___" in class_name else class_name.split("_")
        crop_name = parts[0]
        disease_name = "_".join(parts[1:]) if len(parts) > 1 else "Unknown"

        # Save to history immediately before async operations
        try:
            saved_id = save_diagnosis(crop_name, disease_name, confidence)
            print(f"✓ Saved diagnosis id={saved_id}: {crop_name} / {disease_name}")
        except Exception as e:
            print(f"✗ save_diagnosis failed: {e}")

        loop = asyncio.get_event_loop()
        heatmap_future = loop.run_in_executor(_executor, lambda: heatmap_to_base64(pil_image, compute_gradcam(ModelState.model, img_array, class_idx)))
        gemini_future = loop.run_in_executor(_executor, lambda: get_enhanced_treatment(crop_name, disease_name, treatment))

        try:
            heatmap_b64, enhanced = await asyncio.gather(heatmap_future, gemini_future, return_exceptions=True)
            if isinstance(heatmap_b64, Exception):
                print(f"Heatmap error: {heatmap_b64}")
                heatmap_b64 = None
            if isinstance(enhanced, Exception):
                print(f"Gemini error: {enhanced}")
                enhanced = None
        except Exception as e:
            print(f"Gather error: {e}")
            heatmap_b64 = None
            enhanced = None

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
    return {"history": get_history(limit)}


@app.get("/api/search")
def search_diagnosis(query: str):
    return {"results": search_history(query)}


@app.delete("/api/history")
def delete_all_history():
    deleted = clear_all_history()
    return {"message": f"Deleted {deleted} records", "deleted": deleted}
