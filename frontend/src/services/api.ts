// All backend API calls live here.
// Change VITE_API_URL in your .env file to point to your backend.
const API_BASE = import.meta.env.VITE_API_URL ?? "http://backend:8000";

export interface PredictResponse {
  class: string;       // e.g. "Potato_Late_Blight"
  confidence: number;  // 0.0 – 1.0
  treatment: string;
  heatmap?: string;    // base64 data URI
  enhanced_treatment?: {
    amharic: string;
    traditional: string;
    organic: string;
    prevention: string;
  };
  low_confidence?: boolean;
}

export async function predictDisease(file: File): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Prediction failed");
  }

  return res.json();
}

export async function checkHealth(): Promise<{ status: string; model_loaded: boolean }> {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}

export async function getHistory(limit: number = 50) {
  const res = await fetch(`${API_BASE}/api/history?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function searchHistory(query: string) {
  const res = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function clearHistory() {
  const res = await fetch(`${API_BASE}/api/history`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear history');
  return res.json();
}
