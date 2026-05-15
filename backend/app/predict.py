"""
Prediction helpers
------------------
Handles image preprocessing and running inference with the loaded model.
"""

import io
import numpy as np
from PIL import Image

from app.config import IMG_SIZE, CLASS_NAMES, TREATMENT_ADVICE, HEALTHY_ADVICE


def preprocess_image(file_bytes: bytes) -> tuple[Image.Image, np.ndarray]:
    """
    Convert raw image bytes into:
      - the original PIL image (used later for Grad-CAM overlay)
      - a resized numpy array ready for model inference
    """
    original_image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    resized_image = original_image.resize(IMG_SIZE)

    img_array = np.array(resized_image, dtype=np.float32)      # shape: (240, 240, 3)
    img_array = np.expand_dims(img_array, axis=0)              # shape: (1, 240, 240, 3)
    # Model has built-in preprocessing (rescaling layer), no need for manual preprocessing

    return original_image, img_array


def run_inference(model, img_array: np.ndarray) -> tuple[str, float, int]:
    """
    Run the model and return:
      - detected class name  (e.g. "Potato_Late_Blight")
      - confidence score     (0.0 – 1.0)
      - class index          (used by Grad-CAM)
    """
    predictions = model.predict(img_array)          # shape: (1, num_classes)
    class_idx = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][class_idx])
    
    # Safety check: ensure class_idx is within bounds
    if class_idx >= len(CLASS_NAMES):
        print(f"⚠️  Model predicted class index {class_idx}, but only {len(CLASS_NAMES)} classes defined.")
        print(f"   Model output shape: {predictions.shape}")
        class_name = "Unknown"
    else:
        class_name = CLASS_NAMES[class_idx]
    
    return class_name, confidence, class_idx


def get_treatment(class_name: str) -> str:
    """Return treatment advice for the detected class."""
    if "Healthy" in class_name:
        return HEALTHY_ADVICE
    return TREATMENT_ADVICE.get(class_name, "Consult a local agricultural expert.")
