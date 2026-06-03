"""
Grad-CAM (Gradient-weighted Class Activation Mapping)
------------------------------------------------------
Produces a heatmap that highlights which parts of the leaf image
the model focused on when making its prediction.
"""

import numpy as np
import tensorflow as tf
import keras
from PIL import Image
import io
import base64


def compute_gradcam(model, img_array: np.ndarray, pred_index: int) -> np.ndarray:
    try:
        def find_last_conv(layer):
            if isinstance(layer, keras.layers.Conv2D):
                return layer
            if hasattr(layer, "layers") and layer.layers:
                for child in reversed(layer.layers):
                    found = find_last_conv(child)
                    if found is not None:
                        return found
            return None

        last_conv_layer = None
        for layer in reversed(model.layers):
            last_conv_layer = find_last_conv(layer)
            if last_conv_layer is not None:
                break

        if last_conv_layer is None:
            return np.ones((7, 7)) * 0.5

        grad_model = keras.Model(
            inputs=model.inputs,
            outputs=[last_conv_layer.output, model.output],
        )

        img_tensor = tf.cast(img_array, tf.float32)

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_tensor)
            tape.watch(conv_outputs)
            if pred_index is None:
                pred_index = tf.argmax(predictions[0])
            class_channel = predictions[:, pred_index]

        grads = tape.gradient(class_channel, conv_outputs)
        if grads is None:
            return np.ones((7, 7)) * 0.5

        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_out = conv_outputs[0]
        heatmap = tf.reduce_sum(conv_out * pooled_grads, axis=-1)
        heatmap = tf.nn.relu(heatmap)
        heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-8)
        return heatmap.numpy()

    except Exception as e:
        print(f"Grad-CAM error: {e}")
        return np.ones((7, 7)) * 0.5


def heatmap_to_base64(original_image: Image.Image, heatmap: np.ndarray) -> str:
    """
    Overlay the Grad-CAM heatmap on the original image and return
    the result as a base64-encoded JPEG string ready for the frontend.
    """
    import cv2  # only needed here; keeps the top-level import light

    heatmap_resized = cv2.resize(
        heatmap,
        original_image.size,
        interpolation=cv2.INTER_LINEAR,
    )

    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    original_array = np.array(original_image)
    overlay = cv2.addWeighted(original_array, 0.5, heatmap_colored, 0.5, 0)

    result_image = Image.fromarray(overlay)
    buffer = io.BytesIO()
    result_image.save(buffer, format="JPEG")
    return "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")
