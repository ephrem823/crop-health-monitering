"""
Grad-CAM (Gradient-weighted Class Activation Mapping)
------------------------------------------------------
Produces a heatmap that highlights which parts of the leaf image
the model focused on when making its prediction.
"""

import numpy as np
import tensorflow as tf
from PIL import Image
import io
import base64


def compute_gradcam(model: tf.keras.Model, img_array: np.ndarray, pred_index: int) -> np.ndarray:
    """
    Compute a Grad-CAM heatmap for the given image and predicted class.
    Returns a 2-D float array (heatmap) with values in [0, 1].
    """
    try:
        # Find the EfficientNet submodel
        base_model = None
        for layer in model.layers:
            if hasattr(layer, 'layers') and len(layer.layers) > 10:
                base_model = layer
                break

        if base_model is None:
            return np.ones((7, 7)) * 0.5

        # Find last conv layer in base model
        last_conv_layer = None
        for layer in reversed(base_model.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv_layer = layer
                break

        if last_conv_layer is None:
            return np.ones((7, 7)) * 0.5

        print(f"Grad-CAM: Using layer '{last_conv_layer.name}'")

        # Build grad model using base_model's own input to avoid graph disconnect
        grad_model = tf.keras.Model(
            inputs=base_model.input,
            outputs=[last_conv_layer.output, base_model.output],
        )

        img_tensor = tf.cast(img_array, tf.float32)

        with tf.GradientTape() as tape:
            conv_outputs, base_out = grad_model(img_tensor)
            tape.watch(conv_outputs)
            # Apply remaining layers manually
            x = base_out
            for layer in model.layers:
                if layer == base_model:
                    continue
                if isinstance(layer, tf.keras.layers.InputLayer):
                    continue
                x = layer(x)
            class_score = x[:, pred_index]

        grads = tape.gradient(class_score, conv_outputs)

        if grads is None:
            return np.ones((7, 7)) * 0.5

        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_out = conv_outputs[0]
        heatmap = conv_out @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.nn.relu(heatmap).numpy()

        if heatmap.max() > 0:
            heatmap /= heatmap.max()

        return heatmap

    except Exception as e:
        print(f"Grad-CAM error: {e}")
        return np.ones((7, 7)) * 0.5


def heatmap_to_base64(original_image: Image.Image, heatmap: np.ndarray) -> str:
    """
    Overlay the Grad-CAM heatmap on the original image and return
    the result as a base64-encoded JPEG string ready for the frontend.
    """
    import cv2  # only needed here; keeps the top-level import light

    # Resize heatmap to match the original image
    heatmap_resized = cv2.resize(heatmap, original_image.size)

    # Convert to a colour map (jet: blue=low, red=high)
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    # Blend with original image
    original_array = np.array(original_image)
    overlay = (0.6 * original_array + 0.4 * heatmap_colored).astype(np.uint8)

    # Encode to base64
    result_image = Image.fromarray(overlay)
    buffer = io.BytesIO()
    result_image.save(buffer, format="JPEG")
    return "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")
