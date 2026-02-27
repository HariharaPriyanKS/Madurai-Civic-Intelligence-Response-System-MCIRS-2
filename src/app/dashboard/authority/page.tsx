"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PriorityBadge } from "@/components/dashboard/PriorityBadge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { processAnalytics } from "@/lib/analytics-logic";
import { calculateSeriousnessScore, getPriorityTag } from "@/lib/priority-logic";
import { calculateDisplayStatus } from "@/lib/issue-logic";
import { WardComplaintsChart, StatusDistributionChart, AgeDistributionChart } from "@/components/analytics/AnalyticsCharts";
import { NegligenceAlerts } from "@/components/analytics/NegligenceAlerts";
import { Button } from "@/components/ui/button";
import { Download, Filter, TrendingUp, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

export default function AuthorityDashboard() {
  const db = useFirestore();
  const issuesRef = useMemoFirebase(() => collection(db, "issues_all"), [db]);
  const { data: issues, isLoading } = useCollection(issuesRef);

  const stats = issues ? processAnalytics(issues) : null;

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
            <Button variant="outline" className="rounded-xl h-12 gap-2">
              <Download className="h-4 w-4" /> Governance Report
            </Button>
            <Button className="rounded-xl h-12 gap-2">
              <TrendingUp className="h-4 w-4" /> Support Heatmap
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="grid grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-xl" />
              <div className="h-96 bg-muted rounded-xl" />
            </div>
          </div>
        ) : (
          <>
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
              <WardComplaintsChart data={stats?.wardStats || []} />
              <AgeDistributionChart data={stats?.ageStats || []} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
