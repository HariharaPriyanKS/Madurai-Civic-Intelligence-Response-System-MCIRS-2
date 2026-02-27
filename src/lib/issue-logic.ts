/**
 * @fileOverview Core logic for the Mandatory Evidence Engine.
 * Enforces strict status transitions and governance risk calculations.
 */

import { InternalStatus, UserRole } from "./constants";

export type DisplayStatus = 'Yellow' | 'Blue' | 'Orange' | 'Dark Red' | 'Red' | 'Green';

export interface IssueStatusContext {
  internalStatus: string;
  isSlaBreached: boolean;
  reopenCount: number;
  hasProof: boolean;
  isProofVerified: boolean;
}

/**
 * Strictly calculates the UI display status based on governance rules.
 * Overrides manual status changes if evidence is missing or invalid.
 */
export function calculateDisplayStatus(context: IssueStatusContext): DisplayStatus {
  const { internalStatus, isSlaBreached, reopenCount, hasProof, isProofVerified } = context;

  // 1. SLA Breach takes priority for urgency (Dark Red)
  if (isSlaBreached) return 'Dark Red';

  // 2. Initial state (Yellow)
  if (internalStatus === 'Created') return 'Yellow';

  // 3. Acknowledged state (Blue)
  if (internalStatus === 'Acknowledged') return 'Blue';

  // 4. In Progress state (Orange)
  if (internalStatus === 'InProgress') return 'Orange';

  // 5. Resolution Logic (The Mandatory Evidence Filter)
  if (internalStatus === 'ResolvedByOfficer' || internalStatus === 'Closed') {
    // ONLY Green if verified proof exists
    if (hasProof && isProofVerified) {
      return 'Green';
    }
    // No proof or unverified proof while claiming to be resolved (Red)
    return 'Red';
  }

  // 6. Reopened state (Red)
  if (internalStatus === 'Reopened' || reopenCount > 0) {
    return 'Red';
  }

  return 'Red'; // Default safe state
}

/**
 * Determines if an issue represents a governance integrity risk.
 */
export function isGovernanceIntegrityRisk(reopenCount: number): boolean {
  return reopenCount > 2;
}

/**
 * Returns the CSS classes for a given display status.
 */
export function getStatusStyles(status: DisplayStatus) {
  switch (status) {
    case 'Yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Blue': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Orange': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Dark Red': return 'bg-red-900 text-white border-red-950';
    case 'Red': return 'bg-red-100 text-red-700 border-red-200';
    case 'Green': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function getStatusLabel(status: DisplayStatus) {
  switch (status) {
    case 'Yellow': return 'Newly Created';
    case 'Blue': return 'Acknowledged';
    case 'Orange': return 'In Progress';
    case 'Dark Red': return 'SLA Breached';
    case 'Red': return 'Not Completed / No Proof';
    case 'Green': return 'Completed';
    default: return 'Unknown';
  }
}
