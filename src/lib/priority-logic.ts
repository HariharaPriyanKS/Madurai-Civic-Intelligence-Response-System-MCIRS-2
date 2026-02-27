/**
 * @fileOverview Core logic for the Citizen Support Weighted Priority System (CSWPS).
 * Implements the mathematical seriousness score formula and priority tagging.
 */

import { differenceInHours } from "date-fns";

export type PriorityImpact = 'Low Impact' | 'Moderate Impact' | 'High Impact' | 'Critical';

export interface PriorityContext {
  supportCount: number;
  isSlaBreached: boolean;
  reopenCount: number;
  wardIssueDensity: number; // Normalized 0-1 factor for Hotspot Recurrence
  reportedAt: string;
}

const WEIGHTS = {
  BASE: 10,
  SUPPORT: 2,
  SLA_BREACH: 25,
  REOPEN: 15,
  HOTSPOT: 20,
  AGE: 10
};

/**
 * Calculates the age factor (A) based on the requirement:
 * 0–24h → 0.1, 1–3 days → 0.3, 3–7 days → 0.6, 7+ days → 1.0
 */
function calculateAgeFactor(reportedAt: string): number {
  const hours = differenceInHours(new Date(), new Date(reportedAt));
  if (hours <= 24) return 0.1;
  if (hours <= 72) return 0.3;
  if (hours <= 168) return 0.6;
  return 1.0;
}

/**
 * Computes the dynamic Seriousness Score using the CSWPS formula.
 * SeriousnessScore = Base + (S * SupportWeight) + (B * SLABreachWeight) + (R * ReopenWeight) + (H * HotspotWeight) + (A * AgeWeight)
 */
export function calculateSeriousnessScore(context: PriorityContext): number {
  const S = context.supportCount;
  const B = context.isSlaBreached ? 1 : 0;
  const R = context.reopenCount;
  const H = context.wardIssueDensity; // 0-1 normalized hotspot factor
  const A = calculateAgeFactor(context.reportedAt);

  const score = 
    WEIGHTS.BASE +
    (S * WEIGHTS.SUPPORT) +
    (B * WEIGHTS.SLA_BREACH) +
    (R * WEIGHTS.REOPEN) +
    (H * WEIGHTS.HOTSPOT) +
    (A * WEIGHTS.AGE);

  return Math.round(score);
}

/**
 * Maps a numeric score to a priority tag.
 */
export function getPriorityTag(score: number): PriorityImpact {
  if (score < 30) return 'Low Impact';
  if (score < 70) return 'Moderate Impact';
  if (score < 120) return 'High Impact';
  return 'Critical';
}

/**
 * Returns color classes for priority tags.
 */
export function getPriorityStyles(impact: PriorityImpact): string {
  switch (impact) {
    case 'Low Impact': return 'bg-green-50 text-green-700 border-green-200';
    case 'Moderate Impact': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'High Impact': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Critical': return 'bg-red-600 text-white border-red-700 animate-pulse';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
