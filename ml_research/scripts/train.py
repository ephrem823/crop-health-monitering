"""
Crop Health Model — Training Script
=====================================
This script trains an EfficientNet-B0 model to detect diseases in
Maize, Potato, and Tomato leaf images.

HOW TO USE
----------
1. Download the PlantVillage dataset from Kaggle:
   https://www.kaggle.com/datasets/emmarex/plantdisease

2. Organise your images like this:
   ml/data/
   ├── train/
   │   ├── Maize_Healthy/          ← folder name = class name
   │   ├── Maize_Common_Rust/
   │   ├── Potato_Late_Blight/
   │   └── ...
   └── val/
       ├── Maize_Healthy/
       └── ...

3. Run this script from the project root:
   python backend/ml/train.py

4. The trained model is saved to:
   backend/ml/models/crop_health_model.h5

WHAT EACH STEP DOES
-------------------
Step 1 — Data loading    : Read images from disk, resize to 224×224
Step 2 — Augmentation    : Randomly flip/rotate images to prevent overfitting
Step 3 — Base model      : Load EfficientNet-B0 pre-trained on ImageNet
Step 4 — Fine-tuning     : Freeze base, train only the new top layers first
Step 5 — Unfreeze & tune : Unfreeze top layers of base model for better accuracy
Step 6 — Save model      : Write the final model to disk
"""

import os
import sys
import ssl
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from tensorflow.keras.applications import EfficientNetB0
preprocess_input = tf.keras.applications.efficientnet.preprocess_input

# Fix SSL certificate verification issue
ssl._create_default_https_context = ssl._create_unverified_context

# ── Configuration ─────────────────────────────────────────────────────────────

DATA_DIR    = "../data"          # Root folder with train/ and val/ sub-folders
MODEL_OUT   = "../../backend/models/crop_health_model.h5"
IMG_SIZE    = (224, 224)
BATCH_SIZE  = 32
EPOCHS_HEAD = 10    # Epochs to train only the new top layers
EPOCHS_FINE = 10    # Additional epochs after unfreezing some base layers
NUM_CLASSES = 17    # Updated: 4 Maize + 3 Potato + 10 Tomato

# ── Step 1: Load images from disk ─────────────────────────────────────────────

print("\n[Step 1] Loading images from disk...")

train_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATA_DIR, "train"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",   # One-hot encoded labels
    shuffle=True,
    seed=42,
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATA_DIR, "val"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",
    shuffle=False,
)

class_names = train_ds.class_names
print(f"  Found {len(class_names)} classes: {class_names}")

# ── Step 2: Data augmentation & preprocessing ─────────────────────────────────

print("\n[Step 2] Applying data augmentation...")

# Augmentation is applied only during training to create variety
augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.2),
    layers.RandomZoom(0.1),
    layers.RandomBrightness(0.1),
], name="augmentation")

def prepare(ds, augment=False):
    """Apply EfficientNet preprocessing and optional augmentation."""
    ds = ds.map(lambda x, y: (preprocess_input(x), y), num_parallel_calls=tf.data.AUTOTUNE)
    if augment:
        ds = ds.map(lambda x, y: (augmentation(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)
    return ds.prefetch(tf.data.AUTOTUNE)   # Load next batch while GPU trains

train_ds = prepare(train_ds, augment=True)
val_ds   = prepare(val_ds,   augment=False)

# ── Step 3: Build the model ───────────────────────────────────────────────────

print("\n[Step 3] Building model with EfficientNet-B0 base...")

# Load EfficientNet-B0 pre-trained on ImageNet (1.4M images).
# include_top=False removes the original 1000-class head so we can add our own.
base_model = EfficientNetB0(
    weights="imagenet",
    include_top=False,
    input_shape=(*IMG_SIZE, 3),
)
base_model.trainable = False   # Freeze: keep ImageNet weights intact for now
print(f"  Base model layers: {len(base_model.layers)} (all frozen)")

# Add a new classification head for our crop disease classes
inputs  = tf.keras.Input(shape=(*IMG_SIZE, 3))
x       = base_model(inputs, training=False)
x       = layers.GlobalAveragePooling2D()(x)   # Reduce spatial dims to a vector
x       = layers.Dropout(0.3)(x)               # Regularisation to reduce overfitting
x       = layers.Dense(256, activation="relu")(x)
outputs = layers.Dense(NUM_CLASSES, activation="softmax")(x)

model = models.Model(inputs, outputs, name="crop_health_model")

# ── Step 4: Train the top layers only ─────────────────────────────────────────

print(f"\n[Step 4] Training top layers for {EPOCHS_HEAD} epochs...")

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

# Stop early if validation accuracy stops improving
early_stop = callbacks.EarlyStopping(monitor="val_accuracy", patience=3, restore_best_weights=True)
# Reduce learning rate when progress stalls
reduce_lr  = callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, verbose=1)

history_head = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_HEAD,
    callbacks=[early_stop, reduce_lr],
)

# ── Step 5: Fine-tune — unfreeze top layers of the base model ─────────────────

print(f"\n[Step 5] Fine-tuning top 30 layers of EfficientNet for {EPOCHS_FINE} more epochs...")

base_model.trainable = True

# Only unfreeze the last 30 layers; keep earlier layers frozen
for layer in base_model.layers[:-30]:
    layer.trainable = False

unfrozen = sum(1 for l in base_model.layers if l.trainable)
print(f"  Unfrozen base layers: {unfrozen}")

# Use a much smaller learning rate to avoid destroying the pre-trained weights
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

history_fine = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_FINE,
    callbacks=[early_stop, reduce_lr],
)

# ── Step 6: Save the model ────────────────────────────────────────────────────

print(f"\n[Step 6] Saving model to {MODEL_OUT}...")
os.makedirs(os.path.dirname(MODEL_OUT), exist_ok=True)
model.save(MODEL_OUT)
print(f"  ✅ Model saved successfully.")

# ── Final summary ─────────────────────────────────────────────────────────────

final_val_acc = max(history_fine.history.get("val_accuracy", [0]))
print(f"\n{'='*50}")
print(f"  Training complete!")
print(f"  Best validation accuracy: {final_val_acc:.2%}")
print(f"  Model saved to: {MODEL_OUT}")
print(f"  Start the API with: uvicorn backend.app.main:app --reload")
print(f"{'='*50}\n")
