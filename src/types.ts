export type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteLegSummary {
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteOption {
  id: string;
  mode: TravelMode;
  legs: RouteLegSummary[];
  provider: 'google' | 'ors';
  meta?: Record<string, unknown>;
}

export interface RouteMetrics {
  co2Kg: number;
  monetaryCost: number;
  durationSeconds: number;
  distanceKm: number;
}

export interface Recommendation {
  label: 'Greenest' | 'Balanced' | 'Alternative';
  reason: string;
  routeId: string;
}

export interface JourneyRecord {
  id: string;
  userId: string;
  sourceText: string;
  destinationText: string;
  mode: TravelMode;
  routeId: string;
  metrics: RouteMetrics;
  co2SavedKg?: number;
  startedAt: number;
  completedAt: number;
  media?: { url: string; kind: 'photo' | 'video'; takenAt?: number }[];
}

export interface PointsSummary {
  totalPoints: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt?: number;
}

export const EMISSION_FACTORS_KG_PER_KM: Record<TravelMode, number> = {
  DRIVING: 0.192, // average petrol car kg CO2e per km
  TRANSIT: 0.065, // public transport average per passenger km
  BICYCLING: 0.0, // assumed zero tailpipe
  WALKING: 0.0,
};

export const COST_PER_KM_USD: Record<TravelMode, number> = {
  DRIVING: 0.12, // fuel + wear estimate
  TRANSIT: 0.05, // average transit fare amortized per km
  BICYCLING: 0.0,
  WALKING: 0.0,
};

export const POINTS_PER_10KM = 5; // 10 km = 5 points
export const POINTS_TO_BADGE = 100; // 100 points = 1 badge

