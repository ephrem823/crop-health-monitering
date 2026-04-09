"""
Unified Dataset Downloader
Downloads and organizes all crop datasets (Potato, Tomato, Maize) from Kaggle
"""

import os
import shutil
from pathlib import Path

try:
    import kagglehub
except ImportError:
    print("Installing kagglehub...")
    os.system("pip install kagglehub")
    import kagglehub

# Setup directories
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
TRAIN_DIR = DATA_DIR / "train"
VAL_DIR = DATA_DIR / "val"

TRAIN_DIR.mkdir(parents=True, exist_ok=True)
VAL_DIR.mkdir(parents=True, exist_ok=True)

# Dataset configurations
DATASETS = {
    "potato": "muhammadardiputra/potato-leaf-disease-dataset",
    "tomato": "kaustubhb999/tomatoleaf",
    "maize": "smaranjitghose/corn-or-maize-leaf-disease-dataset"
}

def normalize_class_name(name, crop_type):
    """Normalize class names to standard format"""
    name = name.replace(" ", "_").replace("-", "_")
    
    # Maize-specific normalization
    if crop_type == "maize":
        if "blight" in name.lower():
            return "Maize_Northern_Leaf_Blight"
        elif "rust" in name.lower():
            return "Maize_Common_Rust"
        elif "spot" in name.lower() or "gray" in name.lower():
            return "Maize_Gray_Leaf_Spot"
        elif "healthy" in name.lower():
            return "Maize_Healthy"
    
    # Add crop prefix if not present
    crop_prefix = crop_type.capitalize()
    if not name.startswith(f"{crop_prefix}_"):
        name = f"{crop_prefix}_{name}"
    
    return name

def organize_dataset(downloaded_path, crop_type):
    """Organize downloaded dataset into train/val splits"""
    downloaded_path = Path(downloaded_path)
    
    for item in downloaded_path.rglob("*"):
        if item.is_dir():
            images = list(item.glob("*.jpg")) + list(item.glob("*.JPG")) + \
                     list(item.glob("*.png")) + list(item.glob("*.PNG")) + \
                     list(item.glob("*.jpeg")) + list(item.glob("*.JPEG"))
            
            if images and len(images) > 10:
                class_name = normalize_class_name(item.name, crop_type)
                
                print(f"\n  Found {len(images)} images for: {class_name}")
                
                # 80/20 train/val split
                split_idx = int(len(images) * 0.8)
                train_images = images[:split_idx]
                val_images = images[split_idx:]
                
                # Create class folders
                train_class_dir = TRAIN_DIR / class_name
                val_class_dir = VAL_DIR / class_name
                train_class_dir.mkdir(exist_ok=True)
                val_class_dir.mkdir(exist_ok=True)
                
                # Copy images
                for i, img in enumerate(train_images):
                    dest = train_class_dir / f"{class_name}_{i}{img.suffix}"
                    shutil.copy2(img, dest)
                
                for i, img in enumerate(val_images):
                    dest = val_class_dir / f"{class_name}_{i}{img.suffix}"
                    shutil.copy2(img, dest)
                
                print(f"    Train: {len(train_images)} | Val: {len(val_images)}")

# Main download process
print("="*60)
print("UNIFIED DATASET DOWNLOADER")
print("="*60)

for crop_type, dataset_name in DATASETS.items():
    print(f"\n[{crop_type.upper()}] Downloading from Kaggle...")
    try:
        path = kagglehub.dataset_download(dataset_name)
        print(f"  Downloaded to: {path}")
        organize_dataset(path, crop_type)
    except Exception as e:
        print(f"  ERROR: {e}")
        continue

# Summary
train_classes = sorted([d.name for d in TRAIN_DIR.iterdir() if d.is_dir()])
print("\n" + "="*60)
print("DOWNLOAD COMPLETE!")
print("="*60)
print(f"Total classes: {len(train_classes)}")
print(f"\nClasses organized:")
for cls in train_classes:
    print(f"  - {cls}")
print(f"\nData location:")
print(f"  Train: {TRAIN_DIR}")
print(f"  Val: {VAL_DIR}")
print("\nNext step: Run train_model.ipynb to train the model")
print("="*60)
