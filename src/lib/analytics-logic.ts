/**
 * @fileOverview Helper logic for MCIRS Analytics Engine.
 * Processes raw issue data into aggregated metrics for charts and alerts.
 */

import { differenceInHours } from "date-fns";
import { WARDS, CATEGORIES, SLA_DEADLINES } from "./constants";

export interface AnalyticsData {
  wardStats: any[];
  statusStats: any[];
  deptStats: any[];
  ageStats: any[];
  alerts: {
    worstWard: string;
    worstDept: string;
    worstWorker: string;
    worstContractor: string;
  };
}

export function processAnalytics(issues: any[]): AnalyticsData {
  const now = new Date();

  // 1. Ward-wise Aggregation
  const wardMap = new Map();
  WARDS.forEach(w => wardMap.set(w.name, { name: w.name, total: 0, resolved: 0, pending: 0, slaBreached: 0 }));

  issues.forEach(issue => {
    const stats = wardMap.get(issue.wardId) || { name: issue.wardId, total: 0, resolved: 0, pending: 0, slaBreached: 0 };
    stats.total++;
    if (issue.status === 'Closed' || issue.status === 'ResolvedByOfficer') stats.resolved++;
    else stats.pending++;
    if (issue.isSlaBreached) stats.slaBreached++;
    wardMap.set(issue.wardId, stats);
  });

  const wardStats = Array.from(wardMap.values()).sort((a, b) => b.total - a.total);

  // 2. Status Distribution
  const statusCounts = {
    slaBreached: issues.filter(i => i.isSlaBreached).length,
    nearDeadline: issues.filter(i => !i.isSlaBreached && i.status !== 'Closed' && i.status !== 'ResolvedByOfficer').length, // Mock logic for "near"
    pendingAck: issues.filter(i => i.status === 'Created').length,
    withinSla: issues.filter(i => !i.isSlaBreached && (i.status === 'Closed' || i.status === 'ResolvedByOfficer')).length
  };

  const statusStats = [
    { name: 'SLA Breached', value: statusCounts.slaBreached, fill: 'hsl(var(--destructive))' },
    { name: 'Near Deadline', value: statusCounts.nearDeadline, fill: 'hsl(var(--secondary))' },
    { name: 'Pending Ack', value: statusCounts.pendingAck, fill: 'hsl(var(--primary))' },
    { name: 'Within SLA', value: statusCounts.withinSla, fill: '#10b981' }
  ];

  // 3. Department Performance
  const deptMap = new Map();
  CATEGORIES.forEach(cat => deptMap.set(cat, { name: cat, total: 0, pending: 0, slaBreachCount: 0 }));

  issues.forEach(issue => {
    const stats = deptMap.get(issue.issueCategoryId) || { name: issue.issueCategoryId, total: 0, pending: 0, slaBreachCount: 0 };
    stats.total++;
    if (issue.status !== 'Closed') stats.pending++;
    if (issue.isSlaBreached) stats.slaBreachCount++;
    deptMap.set(issue.issueCategoryId, stats);
  });

  const deptStats = Array.from(deptMap.values()).map(d => ({
    ...d,
    slaBreachRate: d.total > 0 ? (d.slaBreachCount / d.total) * 100 : 0
  }));

  // 4. Age Distribution
  const ageBuckets = [
    { range: '0-24h', count: 0 },
    { range: '1-3d', count: 0 },
    { range: '3-7d', count: 0 },
    { range: '7d+', count: 0 }
  ];

  issues.forEach(issue => {
    if (issue.status === 'Closed') return;
    const hours = differenceInHours(now, new Date(issue.reportedAt));
    if (hours <= 24) ageBuckets[0].count++;
    else if (hours <= 72) ageBuckets[1].count++;
    else if (hours <= 168) ageBuckets[2].count++;
    else ageBuckets[3].count++;
  });

  // 5. Negligence Alerts
  const worstWard = wardStats[0]?.name || "None";
  const worstDept = deptStats.sort((a, b) => b.slaBreachRate - a.slaBreachRate)[0]?.name || "None";

  return {
    wardStats,
    statusStats,
    deptStats,
    ageStats: ageBuckets,
    alerts: {
      worstWard,
      worstDept,
      worstWorker: "Simulation Active", // Placeholder for worker tracking
      worstContractor: "Simulation Active"
    }
  };
}
