"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/dashboard/PriorityBadge";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { processAnalytics, AnalyticsFilters } from "@/lib/analytics-logic";
import { calculateSeriousnessScore, getPriorityTag } from "@/lib/priority-logic";
import { WardComplaintsChart, StatusDistributionChart, AgeDistributionChart } from "@/components/analytics/AnalyticsCharts";
import { NegligenceAlerts } from "@/components/analytics/NegligenceAlerts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, AlertTriangle, Loader2, FilterX } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/constants";

export default function AuthorityDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const issuesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "issues_all");
  }, [db, user]);

  const { data: issues, isLoading } = useCollection(issuesRef);

  const stats = useMemo(() => {
    return issues ? processAnalytics(issues, filters) : null;
  }, [issues, filters]);

  const topCriticalIssues = useMemo(() => {
    if (!issues) return [];
    return [...issues]
      .map(issue => {
        const score = calculateSeriousnessScore({
          supportCount: issue.supportCount || 0,
          isSlaBreached: issue.isSlaBreached || false,
          reopenCount: issue.reopenCount || 0,
          wardIssueDensity: issue.wardIssueDensity || 0.5,
          reportedAt: issue.reportedAt
        });
        return { ...issue, seriousnessScore: score };
      })
      .sort((a, b) => b.seriousnessScore - a.seriousnessScore)
      .slice(0, 10);
  }, [issues]);

  const resetFilters = () => setFilters({});

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-32">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Governance Intelligence</h1>
            <p className="text-muted-foreground">Impact-weighted prioritization and community-driven oversight.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-xl h-12 gap-2" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Governance Report
            </Button>
            <Button className="rounded-xl h-12 gap-2">
              <TrendingUp className="h-4 w-4" /> Support Heatmap
            </Button>
          </div>
        </header>

        {isLoading || !user ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Establishing Secure Connection...</p>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="mb-8 flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-2xl border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Filter By:</span>
                <Select 
                  value={filters.category || "all"} 
                  onValueChange={(val) => setFilters(prev => ({ ...prev, category: val === "all" ? undefined : val }))}
                >
                  <SelectTrigger className="w-[180px] rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select 
                value={filters.status || "all"} 
                onValueChange={(val) => setFilters(prev => ({ ...prev, status: val === "all" ? undefined : val }))}
              >
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Created">Newly Created</SelectItem>
                  <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="ResolvedByOfficer">Resolved</SelectItem>
                </SelectContent>
              </Select>

              {Object.keys(filters).length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2 text-muted-foreground">
                  <FilterX className="h-4 w-4" /> Reset
                </Button>
              )}
            </div>

            <NegligenceAlerts alerts={stats?.alerts || { worstWard: '...', worstDept: '...', worstWorker: '...', worstContractor: '...' }} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <Card className="lg:col-span-2 border-none shadow-xl">
                <CardHeader className="bg-muted/20 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Top 10 High Priority Issues (CSWPS)
                      </CardTitle>
                      <CardDescription>Automatically sorted by Impact-Weighted Seriousness Score.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Ticket</TableHead>
                          <TableHead>Ward</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Support</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topCriticalIssues.map((issue) => (
                          <TableRow key={issue.id}>
                            <TableCell className="font-bold text-xs uppercase">{issue.id}</TableCell>
                            <TableCell className="text-xs">{issue.wardId}</TableCell>
                            <TableCell>
                              <PriorityBadge 
                                impact={getPriorityTag(issue.seriousnessScore)} 
                                score={issue.seriousnessScore} 
                              />
                            </TableCell>
                            <TableCell className="font-bold">{issue.supportCount || 0}</TableCell>
                            <TableCell className="text-right font-mono font-bold text-primary">
                              {issue.seriousnessScore}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                <StatusDistributionChart data={stats?.statusStats || []} />
                <Card className="border-none shadow-lg">
                   <CardHeader>
                      <CardTitle>Impact Summary</CardTitle>
                      <CardDescription>Support Growth Metrics</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Daily Support Trend</p>
                        <Badge className="bg-green-100 text-green-700">+12%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Critical Hotspots</p>
                        <Badge className="bg-red-100 text-red-700">4 Active</Badge>
                      </div>
                   </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {stats && (
                <>
                  <WardComplaintsChart data={stats.wardStats} />
                  <AgeDistributionChart data={stats.ageStats} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
