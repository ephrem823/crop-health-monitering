# EthioCrop Mobile App (React Native + Expo)

Mobile version of the EthioCrop Health Monitoring System.

## Setup

```bash
cd mobile
npm install
```

## Configure API URL

Edit `services/api.ts` and set `API_BASE` to your backend IP:

```ts
// Android emulator
export const API_BASE = 'http://10.0.2.2:8000';

// iOS simulator
export const API_BASE = 'http://localhost:8000';

// Real device (use your machine's local IP)
export const API_BASE = 'http://192.168.x.x:8000';
```

Find your local IP with: `ifconfig | grep "inet "` (macOS)

## Run

```bash
# Start Expo dev server
npm start

# iOS simulator
npm run ios

# Android emulator
npm run android

# Scan QR code with Expo Go app on your phone
npm start
```

## Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx          # Root layout
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar config
│       ├── index.tsx        # Home screen
│       ├── diagnosis.tsx    # Camera + image upload + analysis
│       ├── history.tsx      # Diagnosis history with search
│       └── about.tsx        # About & team
├── components/
│   └── ResultsDisplay.tsx   # Full diagnosis result with all 6 treatment sections
├── services/
│   └── api.ts               # Backend API calls (same endpoints as web)
├── types/
│   └── diagnosis.ts         # TypeScript interfaces
└── constants/
    └── Colors.ts            # App theme colors
```

## Features
- 📸 Camera capture or gallery upload
- 🤖 AI disease detection (50 classes)
- 🌡️ Grad-CAM heatmap visualization
- 🌍 Treatment in English, Amharic, Afaan Oromoo
- 🌿 Traditional & organic remedy sections
- 📋 Diagnosis history with search
- 🔒 Runs against your local FastAPI backend
