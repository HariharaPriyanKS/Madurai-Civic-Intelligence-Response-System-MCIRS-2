"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { calculateDisplayStatus } from "@/lib/issue-logic";
import { AlertTriangle, TrendingUp, ShieldAlert, BarChart3, FileText, Download, Filter } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { processAnalytics } from "@/lib/analytics-logic";
import { WardComplaintsChart, StatusDistributionChart, AgeDistributionChart } from "@/components/analytics/AnalyticsCharts";
import { NegligenceAlerts } from "@/components/analytics/NegligenceAlerts";
import { Button } from "@/components/ui/button";

export default function AuthorityDashboard() {
  const db = useFirestore();
  const issuesRef = useMemoFirebase(() => collection(db, "issues_all"), [db]);
  const { data: issues, isLoading } = useCollection(issuesRef);

  const stats = issues ? processAnalytics(issues) : null;

  const handleExportCSV = () => {
    if (!issues) return;
    const headers = "ID,Ward,Category,Status,SLA Breached,Reported At\n";
    const rows = issues.map(i => `${i.id},${i.wardId},${i.issueCategoryId},${i.status},${i.isSlaBreached},${i.reportedAt}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MCIRS_Governance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-32">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Governance Intelligence</h1>
            <p className="text-muted-foreground">City-wide performance oversight and administrative risk analysis.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-xl h-12 gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button className="rounded-xl h-12 gap-2">
              <Filter className="h-4 w-4" /> Advanced Filters
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
            <div className="h-96 bg-muted rounded-xl col-span-2" />
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        ) : stats ? (
          <>
            <NegligenceAlerts alerts={stats.alerts} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <WardComplaintsChart data={stats.wardStats} />
              <div className="col-span-1 space-y-8">
                <StatusDistributionChart data={stats.statusStats} />
                <AgeDistributionChart data={stats.ageStats} />
              </div>
              <Card className="border-none shadow-lg md:col-span-1">
                 <CardHeader>
                    <CardTitle>City Health</CardTitle>
                    <CardDescription>Live MCII Aggregates</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Overall Satisfaction</p>
                        <p className="text-3xl font-bold">4.2 / 5.0</p>
                        <Badge className="bg-green-100 text-green-700 mt-1">+0.4% MoM</Badge>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Budget Compliance</p>
                        <p className="text-3xl font-bold">94.2%</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Avg. Evidence Rate</p>
                        <p className="text-3xl font-bold">100%</p>
                        <p className="text-[10px] text-muted-foreground">Mandatory Closure Applied</p>
                    </div>
                 </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
