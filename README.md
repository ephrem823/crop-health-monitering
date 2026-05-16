# Crop Health Monitoring System

AI powered crop disease detection for Ethiopian farmers. Upload a leaf photo and get instant diagnosis with treatment advice.

---

## 📁 Project Structure

```
CROP-HEALTH-MONITERING/
├── backend/                  # FastAPI backend
│   ├── app/                  # API code
│   └── models/               # Trained model (.h5)
├── frontend/                 # React frontend
├── ml_research/              # Training & datasets
│   ├── notebooks/            # Jupyter notebooks
└── start.ps1                 # Run script
```

---

## 🚀 Quick Start

### 1. Download Dataset (First Time Only)

```bash
cd ml_research
python download_all_datasets.py
```

This downloads and organizes:
- **Potato** (3 classes): Healthy, Early Blight, Late Blight
- **Tomato** (10 classes): Healthy, Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus
- **Maize** (4 classes): Healthy, Common Rust, Gray Leaf Spot, Northern Leaf Blight
Fruit Crops:

-**Apple:** 4 classes (Scab, Black Rot, Rust, Healthy).

-**Grape:** 4 classes (Black Rot, Esca, Leaf Blight, Healthy).

Other Fruits: Includes Healthy/Diseased classes for Blueberry, Cherry, Orange, Peach, Raspberry, and Strawberry.

Vegetables & Legumes:

Pepper (Bell): 2 classes (Bacterial Spot, Healthy).

Others: Includes Squash and Soybean categories.

System Validation Classes:

NOT_A_PLANT: Used to filter out non-agricultural images and prevent false positives.

test: A dedicated class used for internal verification.

**Total: 50 classes**

---

### 2. Train Model (First Time Only)

**Option A: Jupyter Notebook (Recommended)**
```bash
cd ml_research/notebooks
jupyter notebook
# Open train_model.ipynb and run all cells
```

**Option B: Python Script**
```bash
cd ml_research/scripts
python train.py
```

Model saves to: `backend/models/crop_health_model_fixed.h5`

---

### 3. Run the App

```bash
.\start.ps1
```

This starts:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

---

## 🌾 Supported Crops

Crop Category,Key Supported Varieties
Major Staples,"Maize (4 classes), Potato (3 classes), Tomato (10 classes) "
Regional Specialty,"Coffee (4 classes: Cerscospora, Rust, Phoma, Healthy), Enset (Bacterial Wilt) "
Horticulture,"Apple, Grape, Orange, Peach, Pepper, Strawberry "
Validation,NOT_A_PLANT class to filter non-agricultural imagery 

---

## 🔧 API Endpoints

| Method | Path          | Description                  |
|--------|---------------|------------------------------|
| GET    | /api/health   | Check API status             |
| POST   | /api/predict  | Upload image, get diagnosis  |
| GET    | /api/history  | Get diagnosis history        |
| GET    | /api/search   | Search history               |
| DELETE | /api/history  | Clear all history            |

---

## 💾 Database

SQLite database at `backend/app/database.db` stores:
- Diagnosis history
- Crop and disease names
- Confidence scores
- Timestamps

---

## 🤖 AI Features

- **Model**: PlantDiseaseProV1 (EfficientNet-B0 based)
- **Input Size**: 240×240 pixels
- **Grad-CAM**: Visual explanation of predictions
- **Gemini AI**: Enhanced treatment advice in Amharic
- **Confidence Threshold**: Rejects unknown crops (<75%)

---

## 📝 Utilities

```bash
# View database records
python view_database.py

# Export to pdf
python export_database.py
```

---

## 🔑 Environment Variables

**Backend** (`backend/.env`):
```
GEMINI_API_KEY=your_api_key_here
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:8000
```

---

## 📚 Notebooks

- **train_model.ipynb**: Train new model from scratch
- **evaluate_model.ipynb**: Load and evaluate existing model

---

## 🛠️ Tech Stack

- **Backend**: FastAPI, TensorFlow, OpenCV
- **Frontend**: React, TypeScript, Vite
- **ML**: EfficientNet-B0, Grad-CAM
- **AI**: Google Gemini API
- **Database**: SQLite

---
---

### 🤝 Contributing


### 👥 Group Members 

This project was developed by:

* **Biniyam Solomon**
* **Murad Ali**
* **Ephrem Alemayehu**
* **Minase Mamacha**

---
### 📄 License

This project is for educational purposes only and is not licensed for commercial use.
