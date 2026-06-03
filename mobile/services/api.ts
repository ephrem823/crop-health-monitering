// Change this to your backend IP when testing on a real device
// For emulator: use http://10.0.2.2:8000 (Android) or http://localhost:8000 (iOS simulator)
export const API_BASE = 'http://192.168.137.90:8000';

export interface PredictResponse {
  class: string;
  confidence: number;
  treatment: string;
  heatmap?: string;
  enhanced_treatment?: {
    amharic: string;
    english: string;
    oromoo: string;
    traditional: string;
    organic: string;
    prevention: string;
  };
}

export async function predictDisease(imageUri: string, mimeType = 'image/jpeg'): Promise<PredictResponse> {
  const form = new FormData();
  form.append('file', {
    uri: imageUri,
    name: 'leaf.jpg',
    type: mimeType,
  } as unknown as Blob);

  // DO NOT set Content-Type manually — React Native sets it with the multipart boundary automatically
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? 'Prediction failed');
  }
  return res.json();
}

export async function checkHealth(): Promise<{ status: string; model_loaded: boolean }> {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}

export async function getHistory(limit = 50) {
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
  const res = await fetch(`${API_BASE}/api/history`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear history');
  return res.json();
}
