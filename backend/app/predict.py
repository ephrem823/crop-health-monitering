"""
Prediction helpers
------------------
Handles image preprocessing and running inference with the loaded model.
"""

import io
import numpy as np
from PIL import Image
import tensorflow as tf
preprocess_input = tf.keras.applications.efficientnet.preprocess_input

from app.config import IMG_SIZE, CLASS_NAMES, TREATMENT_ADVICE, HEALTHY_ADVICE


def preprocess_image(file_bytes: bytes) -> tuple[Image.Image, np.ndarray]:
    """
    Convert raw image bytes into:
      - a PIL Image (used later for Grad-CAM overlay)
      - a preprocessed numpy array ready for model inference
    """
    image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    image = image.resize(IMG_SIZE)

    img_array = np.array(image)                        # shape: (224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)      # shape: (1, 224, 224, 3)
    img_array = preprocess_input(img_array)            # EfficientNet normalisation

    return image, img_array


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
    class_name = CLASS_NAMES[class_idx]
    return class_name, confidence, class_idx


def get_treatment(class_name: str) -> str:
    """Return treatment advice for the detected class."""
    if "Healthy" in class_name:
        return HEALTHY_ADVICE
    return TREATMENT_ADVICE.get(class_name, "Consult a local agricultural expert.")
