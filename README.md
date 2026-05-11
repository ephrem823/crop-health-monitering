# Crop Health Monitoring System

AI-powered crop disease detection for Ethiopian farmers. Upload a leaf photo and get instant diagnosis with treatment advice.

---

## 📁 Project Structure

```
ethio_crop_guard/
├── backend/                  # FastAPI backend
│   ├── app/                  # API code
│   └── models/               # Trained model (.h5)
├── frontend/                 # React frontend
├── ml_research/              # Training & datasets
│   ├── data/                 # Dataset (train/val)
│   ├── notebooks/            # Jupyter notebooks
│   └── scripts/              # Training scripts
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

**Total: 17 classes**

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

Model saves to: `backend/models/crop_health_model.h5`

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

| Crop   | Classes |
|--------|---------|
| Maize  | 4       |
| Potato | 3       |
| Tomato | 10      |

**Total: 17 disease classes**

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

# Export to CSV
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

## 📖 Documentation

Model is trained on PlantVillage dataset with Ethiopian cultural context for treatment recommendations.
