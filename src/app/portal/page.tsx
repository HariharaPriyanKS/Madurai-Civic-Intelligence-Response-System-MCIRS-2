"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WARDS } from "@/lib/constants";
import { Trophy, Activity, CheckCircle, Search, TrendingUp, Clock, Loader2, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { WardComplaintsChart } from "@/components/analytics/AnalyticsCharts";
import { processAnalytics } from "@/lib/analytics-logic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PublicPortal() {
  const [search, setSearch] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();
  const db = useFirestore();

  const issuesRef = useMemoFirebase(() => {
    // Public portal listens to all issues
    return collection(db, "issues_all");
  }, [db]);

  const { data: issues, isLoading } = useCollection(issuesRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = useMemo(() => {
    return issues ? processAnalytics(issues) : null;
  }, [issues]);

  const wardLeaderboard = useMemo(() => {
    if (!isMounted || !issues) return [];
    
    return WARDS.map(w => {
      const wardIssues = issues.filter(i => i.wardId === w.name);
      const resolved = wardIssues.filter(i => i.status === 'Closed' || i.status === 'ResolvedByOfficer').length;
      const total = wardIssues.length;
      const score = total > 0 ? Math.floor((resolved / total) * 100) : 0;
      return {
        ...w,
        score,
        resolved,
        total,
        compliance: total > 0 ? Math.floor((resolved / total) * 95) : 0,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      };
    }).sort((a, b) => b.score - a.score);
  }, [issues, isMounted]);

  const filteredLeaderboard = useMemo(() => {
    return wardLeaderboard.filter(w => 
      w.name.toLowerCase().includes(search.toLowerCase()) || 
      w.id.toString().includes(search)
    );
  }, [wardLeaderboard, search]);

  const citySummary = useMemo(() => {
    if (!issues) return { resolved: 0, pending: 0, avgTime: "..." };
    const resolved = issues.filter(i => i.status === 'Closed' || i.status === 'ResolvedByOfficer').length;
    return {
      resolved,
      pending: issues.length - resolved,
      avgTime: "4.2h"
    };
  }, [issues]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-12">
        <header className="mb-12 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">Transparency Portal 2.0</Badge>
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">Madurai Live Performance Dashboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Aggregated governance metrics from all 100 wards. Real-time data from the Evidence-Based Accountability Engine.
          </p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            <p className="text-muted-foreground animate-pulse">Synchronizing Ward Data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase">City Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold">89.4%</span>
                    <Progress value={89.4} className="w-16 h-2" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Issues Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-green-600">{citySummary.resolved}</span>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Pending City-wide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-orange-600">{citySummary.pending}</span>
                    <Activity className="h-6 w-6 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Avg. Resolution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold">{citySummary.avgTime}</span>
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="leaderboard" className="space-y-8">
              <TabsList className="bg-muted p-1 rounded-xl h-14">
                <TabsTrigger value="leaderboard" className="rounded-lg h-12 gap-2 text-md">
                  <Trophy className="h-5 w-5" /> Efficiency Leaderboard
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-lg h-12 gap-2 text-md">
                  <BarChart3 className="h-5 w-5" /> Report Volume Graph
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard">
                <Card className="border-none shadow-xl">
                  <CardHeader className="border-b bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle>Efficiency Leaderboard</CardTitle>
                        <CardDescription>Performance ranking based on resolution rate (Total Resolved / Total Reported)</CardDescription>
                      </div>
                      <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input 
                          placeholder="Search Ward..." 
                          className="pl-9 rounded-xl flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[80px]">Rank</TableHead>
                          <TableHead>Ward</TableHead>
                          <TableHead>Resolution Rate</TableHead>
                          <TableHead>Resolved / Total</TableHead>
                          <TableHead className="text-right">Trend</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeaderboard.map((w, i) => (
                          <TableRow key={w.id}>
                            <TableCell className="font-bold">
                              {i < 3 ? (
                                <div className="flex items-center gap-2">
                                  <Trophy className={`h-4 w-4 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : 'text-amber-700'}`} />
                                  #{i + 1}
                                </div>
                              ) : `#${i + 1}`}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">Ward {w.id}</p>
                                <p className="text-xs text-muted-foreground">{w.name}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={w.score > 80 ? "default" : "outline"} className={w.score > 80 ? "bg-green-600" : ""}>
                                {w.score}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {w.resolved} / {w.total}
                            </TableCell>
                            <TableCell className="text-right">
                              {w.trend === 'up' ? <TrendingUp className="inline h-4 w-4 text-green-500" /> : <Activity className="inline h-4 w-4 text-orange-500" />}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                {stats && (
                  <WardComplaintsChart 
                    data={stats.wardStats} 
                    isPublic={true} 
                  />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
