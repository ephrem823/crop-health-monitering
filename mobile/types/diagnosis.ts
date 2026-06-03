export interface EnhancedTreatment {
  amharic: string;
  english: string;
  oromoo: string;
  traditional: string;
  organic: string;
  prevention: string;
}

export interface DiagnosisResult {
  crop: string;
  disease: string;
  confidence: number;
  treatment: string;
  enhanced_treatment?: EnhancedTreatment;
  heatmap?: string;
  status: 'healthy' | 'diseased' | 'unknown';
}

export interface HistoryItem {
  id: number;
  crop_name: string;
  disease_name: string;
  confidence: number;
  timestamp: string;
}
