/**
 * @fileOverview Helper logic for MCIRS Analytics Engine.
 * Processes raw issue data into aggregated metrics for charts and alerts.
 */

import { differenceInHours, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { WARDS, CATEGORIES } from "./constants";

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

export interface AnalyticsFilters {
  dateRange?: { from: Date; to: Date } | null;
  category?: string;
  status?: string;
  department?: string;
}

export function processAnalytics(issues: any[], filters?: AnalyticsFilters): AnalyticsData {
  const now = new Date();

  // Apply Filters
  const filteredIssues = issues.filter(issue => {
    if (filters?.category && issue.issueCategoryId !== filters.category) return false;
    if (filters?.status && issue.status !== filters.status) return false;
    if (filters?.dateRange) {
      const reportDate = new Date(issue.reportedAt);
      if (!isWithinInterval(reportDate, { 
        start: startOfDay(filters.dateRange.from), 
        end: endOfDay(filters.dateRange.to) 
      })) return false;
    }
    // Department filtering logic (assuming category maps 1:1 to department for now)
    return true;
  });

  // 1. Ward-wise Aggregation (All 100 Wards)
  const wardMap = new Map();
  WARDS.forEach(w => wardMap.set(w.name, { 
    name: w.name, 
    id: w.id,
    total: 0, 
    resolved: 0, 
    pending: 0, 
    slaBreached: 0,
    slaBreachRate: 0
  }));

  filteredIssues.forEach(issue => {
    const stats = wardMap.get(issue.wardId) || { 
      name: issue.wardId, 
      id: issue.wardId, 
      total: 0, 
      resolved: 0, 
      pending: 0, 
      slaBreached: 0,
      slaBreachRate: 0
    };
    stats.total++;
    if (issue.status === 'Closed' || issue.status === 'ResolvedByOfficer') stats.resolved++;
    else stats.pending++;
    if (issue.isSlaBreached) stats.slaBreached++;
    wardMap.set(issue.wardId, stats);
  });

  // Calculate rates and sort
  const wardStats = Array.from(wardMap.values())
    .map(w => ({
      ...w,
      slaBreachRate: w.total > 0 ? Math.round((w.slaBreached / w.total) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);

  // 2. Status Distribution
  const statusCounts = {
    slaBreached: filteredIssues.filter(i => i.isSlaBreached).length,
    nearDeadline: filteredIssues.filter(i => !i.isSlaBreached && i.status !== 'Closed' && i.status !== 'ResolvedByOfficer').length,
    pendingAck: filteredIssues.filter(i => i.status === 'Created').length,
    withinSla: filteredIssues.filter(i => !i.isSlaBreached && (i.status === 'Closed' || i.status === 'ResolvedByOfficer')).length
  };

  const statusStats = [
    { name: 'SLA Breached', value: statusCounts.slaBreached, fill: '#ef4444' },
    { name: 'Near Deadline', value: statusCounts.nearDeadline, fill: '#f97316' },
    { name: 'Pending Ack', value: statusCounts.pendingAck, fill: '#1F66CC' },
    { name: 'Within SLA', value: statusCounts.withinSla, fill: '#10b981' }
  ];

  // 3. Department Performance
  const deptMap = new Map();
  CATEGORIES.forEach(cat => deptMap.set(cat, { name: cat, total: 0, pending: 0, slaBreachCount: 0 }));

  filteredIssues.forEach(issue => {
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

  filteredIssues.forEach(issue => {
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
      worstWorker: "Simulation Active",
      worstContractor: "Simulation Active"
    }
  };
}
