export interface DiagnosisResult {
  crop: string;       // e.g. "Potato"
  disease: string;    // e.g. "Late Blight"
  confidence: number; // 0.0 – 1.0
  treatment: string;
  enhanced_treatment?: {
    amharic: string;
    traditional: string;
    organic: string;
    prevention: string;
  };
  heatmap?: string;   // base64 data URI from Grad-CAM
  status: "healthy" | "diseased";
}
