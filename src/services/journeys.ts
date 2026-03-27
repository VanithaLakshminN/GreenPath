import { JourneyRecord, RouteMetrics, TravelMode } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function saveJourney(params: {
  userId: string;
  sourceText: string;
  destinationText: string;
  mode: TravelMode;
  routeId: string;
  metrics: RouteMetrics;
  co2SavedKg?: number;
  media?: JourneyRecord['media'];
}): Promise<string> {
  const res = await fetch(`${API}/journeys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, co2SavedKg: params.co2SavedKg ?? 0, media: params.media ?? [] }),
  });
  if (!res.ok) throw new Error('Failed to save journey');
  const data = await res.json();
  return data.id;
}

export async function listJourneys(userId: string): Promise<JourneyRecord[]> {
  const res = await fetch(`${API}/journeys/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to load journeys');
  return res.json();
}
