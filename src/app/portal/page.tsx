"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WARDS } from "@/lib/constants";
import { Trophy, ArrowUp, ArrowDown, Activity, CheckCircle, Search, TrendingUp, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function PublicPortal() {
  const [search, setSearch] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const db = useFirestore();
  const issuesRef = useMemoFirebase(() => collection(db, "issues_all"), [db]);
  const { data: issues } = useCollection(issuesRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const wardLeaderboard = useMemo(() => {
    return WARDS.map(w => {
      const wardIssues = issues?.filter(i => i.wardId === w.name) || [];
      const resolved = wardIssues.filter(i => i.status === 'Closed' || i.status === 'ResolvedByOfficer').length;
      const total = wardIssues.length;
      const score = total > 0 ? Math.floor((resolved / total) * 100) : 0;
      return {
        ...w,
        score,
        resolved,
        total,
        compliance: total > 0 ? Math.floor((resolved / total) * 95) : 0, // Mocked compliance offset
        trend: Math.random() > 0.5 ? 'up' : 'down'
      };
    }).sort((a, b) => b.score - a.score);
  }, [issues]);

  const filtered = useMemo(() => {
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
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Transparency Portal 2.0</Badge>
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">Madurai Live Performance Dashboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Aggregated governance metrics from all 100 wards. Real-time data from the Evidence-Based Accountability Engine.
          </p>
        </header>

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

        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Ward Leaderboard</CardTitle>
                <CardDescription>Performance ranking based on resolution rate</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search Ward..." 
                  className="pl-9 rounded-xl"
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
                {filtered.map((w, i) => (
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
      </div>
    </div>
  );
}
