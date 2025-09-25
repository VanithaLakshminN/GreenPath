import { COST_PER_KM_USD, EMISSION_FACTORS_KG_PER_KM, RouteMetrics, RouteOption, TravelMode } from '../types';

function sumDistanceMeters(route: RouteOption): number {
  return route.legs.reduce((acc, leg) => acc + (leg.distanceMeters || 0), 0);
}

function sumDurationSeconds(route: RouteOption): number {
  return route.legs.reduce((acc, leg) => acc + (leg.durationSeconds || 0), 0);
}

export function computeRouteMetrics(route: RouteOption): RouteMetrics {
  const distanceMeters = sumDistanceMeters(route);
  const distanceKm = distanceMeters / 1000;
  const durationSeconds = sumDurationSeconds(route);
  const factor = EMISSION_FACTORS_KG_PER_KM[route.mode as TravelMode] ?? 0;
  const co2Kg = distanceKm * factor;
  const costPerKm = COST_PER_KM_USD[route.mode as TravelMode] ?? 0;
  const monetaryCost = distanceKm * costPerKm;
  return { co2Kg, monetaryCost, durationSeconds, distanceKm };
}

export function chooseGreenestRoute(routes: RouteOption[]): string | null {
  if (routes.length === 0) return null;
  let bestId: string = routes[0].id;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const r of routes) {
    const km = sumDistanceMeters(r) / 1000;
    const factor = EMISSION_FACTORS_KG_PER_KM[r.mode] ?? 0;
    const score = km * factor;
    if (score < bestScore) {
      bestScore = score;
      bestId = r.id;
    }
  }
  return bestId;
}

export function chooseBalancedRoute(routes: RouteOption[]): string | null {
  if (routes.length === 0) return null;
  // Normalize metrics and compute a composite score: 0.5 CO2, 0.3 time, 0.2 cost
  const metrics = routes.map((r) => ({ r, m: computeRouteMetrics(r) }));
  const co2 = metrics.map((x) => x.m.co2Kg);
  const time = metrics.map((x) => x.m.durationSeconds);
  const cost = metrics.map((x) => x.m.monetaryCost);

  const min = (arr: number[]) => Math.min(...arr);
  const max = (arr: number[]) => Math.max(...arr);
  const [co2Min, co2Max] = [min(co2), max(co2)];
  const [timeMin, timeMax] = [min(time), max(time)];
  const [costMin, costMax] = [min(cost), max(cost)];

  let bestId: string | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const { r, m } of metrics) {
    const norm = (val: number, lo: number, hi: number) => (hi - lo === 0 ? 0 : (val - lo) / (hi - lo));
    const score = 0.5 * norm(m.co2Kg, co2Min, co2Max)
      + 0.3 * norm(m.durationSeconds, timeMin, timeMax)
      + 0.2 * norm(m.monetaryCost, costMin, costMax);
    if (score < bestScore) {
      bestScore = score;
      bestId = r.id;
    }
  }
  return bestId;
}

export function alternativeEcoModes(_sourceText: string, _destinationText: string): TravelMode[] {
  // Placeholder: suggest biking and transit as alternatives
  return ['BICYCLING', 'TRANSIT'];
}

