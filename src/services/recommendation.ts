import { Recommendation, RouteOption } from '../types';
import { chooseBalancedRoute, chooseGreenestRoute, computeRouteMetrics, alternativeEcoModes } from './routeMetrics';

export function buildRecommendations(routes: RouteOption[], sourceText: string, destinationText: string): Recommendation[] {
  const recs: Recommendation[] = [];
  const greenId = chooseGreenestRoute(routes);
  if (greenId) recs.push({ label: 'Greenest', reason: 'Lowest estimated CO₂ emissions', routeId: greenId });

  const balancedId = chooseBalancedRoute(routes);
  if (balancedId) recs.push({ label: 'Balanced', reason: 'Optimized mix of eco, time, and cost', routeId: balancedId });

  // For alternatives, suggest modes, but also include the currently provided routes that match
  const altModes = new Set(alternativeEcoModes(sourceText, destinationText));
  for (const r of routes) {
    if (altModes.has(r.mode)) {
      recs.push({ label: 'Alternative', reason: `${r.mode} option`, routeId: r.id });
    }
  }
  return recs;
}

export function summarizeRoute(route: RouteOption) {
  const m = computeRouteMetrics(route);
  return {
    distanceKm: m.distanceKm,
    durationMin: Math.round(m.durationSeconds / 60),
    co2Kg: m.co2Kg,
    cost: m.monetaryCost,
  };
}

