import { Badge, POINTS_PER_10KM, POINTS_TO_BADGE } from '../types';

export function awardPointsForDistance(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  const blocks = Math.floor(distanceKm / 10);
  return blocks * POINTS_PER_10KM;
}

export function awardEcoTaskBonus(taskKey: string): number {
  // Simple static mapping; could be made dynamic/configurable
  const bonusMap: Record<string, number> = {
    'bike_instead_of_car': 20,
    'use_public_transit_today': 10,
    'carpool_to_work': 15,
  };
  return bonusMap[taskKey] ?? 0;
}

export function badgesFromPoints(totalPoints: number): Badge[] {
  if (!Number.isFinite(totalPoints) || totalPoints < 0) return [];
  const numBadges = Math.floor(totalPoints / POINTS_TO_BADGE);
  const badges: Badge[] = [];
  for (let i = 1; i <= numBadges; i++) {
    badges.push({ id: `badge_${i}`, name: `Milestone ${i}`, description: `${i * POINTS_TO_BADGE} points achieved`, earnedAt: Date.now() });
  }
  return badges;
}

