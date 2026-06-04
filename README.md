# 🌿 EthioCrop Health Monitoring System

AI-powered crop disease detection for Ethiopian farmers. Take a leaf photo and get an instant diagnosis with expert treatment advice in **English**, **Amharic (አማርኛ)**, and **Afaan Oromoo**.

---

## Project Structure

```
crop-health-monitering/
├── backend/                  # FastAPI server + ML model
│   ├── app/
│   │   ├── main.py           # API entry point
│   │   ├── config.py         # Class names & treatment advice
│   │   ├── predict.py        # Image preprocessing & inference
│   │   ├── gradcam.py        # Grad-CAM heatmap generation
│   │   ├── database.py       # SQLite history management
│   │   └── gemini_service.py # Gemini AI multilingual treatment
│   ├── models/
│   │   └── crop_health_model_fixed.h5
│   ├── .env                  # API keys (not committed)
│   └── requirements.txt
├── mobile/                   # React Native (Expo) mobile app
│   ├── app/
│   │   ├── _layout.tsx
│   │   └── (tabs)/
│   │       ├── index.tsx     # Home screen
│   │       ├── diagnosis.tsx # Camera + disease analysis
│   │       ├── history.tsx   # Diagnosis history
│   │       └── about.tsx     # About & team
│   ├── components/
│   │   └── ResultsDisplay.tsx
│   ├── services/api.ts       # Backend API calls
│   ├── types/diagnosis.ts    # TypeScript interfaces
│   └── constants/Colors.ts   # App theme
├── ml_research/
│   └── notebooks/            # Model training notebooks
├── start.local.sh            # Quick start script
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native, Expo SDK 54 |
| Backend | FastAPI, Python 3.11 |
| ML Model | TensorFlow 2.16, EfficientNet-B0 |
| Explainability | Grad-CAM |
| AI / NLP | Google Gemini Pro |
| Database | SQLite |
| Image Processing | OpenCV, Pillow |

---

## Setup & Installation

### Prerequisites

- Python 3.11
- Node.js 18+
- Expo Go app on your phone

### 1. Backend

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Mobile App

```bash
cd mobile
npm install
```

Find your machine's local IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Update `mobile/services/api.ts`:
```ts
export const API_BASE = 'http://YOUR_IP:8000';
```

Start the app:
```bash
ulimit -n 65536 && npm start
```

Scan the QR code with **Expo Go** on your phone. Make sure your phone and Mac are on the same WiFi network.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API and model status |
| POST | `/api/predict` | Upload leaf image, get diagnosis |
| GET | `/api/history` | Get recent diagnosis history |
| GET | `/api/search?query=` | Search history |
| DELETE | `/api/history` | Clear all history |

---

## Supported Crops — 50 Disease Classes

| Crop | Conditions |
|------|-----------|
| Coffee | Cercospora, Leaf Rust, Phoma, Healthy |
| Enset | Bacterial Wilt, Healthy |
| Maize / Corn | Common Rust, Gray Leaf Spot, Northern Leaf Blight, Blight, Healthy |
| Potato | Early Blight, Late Blight, Healthy |
| Tomato | Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy |
| Apple | Scab, Black Rot, Cedar Rust, Healthy |
| Grape | Black Rot, Esca, Leaf Blight, Healthy |
| Peach | Bacterial Spot, Healthy |
| Orange | Citrus Greening |
| Strawberry | Leaf Scorch, Healthy |
| Pepper | Bacterial Spot, Healthy |
| Blueberry, Cherry, Raspberry, Soybean | Healthy |
| Squash | Powdery Mildew |

---

## AI Features

- **Model** — EfficientNet-B0 fine-tuned on 50 plant disease classes
- **Input** — 240×240 pixels
- **Confidence Threshold** — predictions below 75% are rejected
- **Grad-CAM** — highlights which leaf regions influenced the prediction
- **Gemini Pro** — generates expert treatment advice in Amharic, Afaan Oromoo, and English with traditional and organic remedy sections

---

## Team — Haramaya University

| Name | Role |
|------|------|
| Biniyam Solomon | ML Model & Training |
| Ephrem Alemayehu | Frontend & Backend API Integration |
| mulat Alameraw | Data Collection & Evaluation |
|Nahom tewdros  | Backend API Integration |

---

*Built with ❤️ for Ethiopian farmers — ለኢትዮጵያ አርሶ አደሮች በፍቅር የተሰራ — Qonnaan bultootaa Itoophiyaaf jaalalaaan kan hojjetame*

---

> Educational purposes only — Not licensed for commercial use.
