"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WARDS } from "@/lib/constants";
import { Trophy, ArrowUp, ArrowDown, Activity, CheckCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";

export default function PublicPortal() {
  const [search, setSearch] = useState("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const data = WARDS.map(w => ({
      ...w,
      score: Math.floor(Math.random() * 30) + 70,
      resolved: Math.floor(Math.random() * 200) + 300,
      compliance: Math.floor(Math.random() * 15) + 80,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    })).sort((a, b) => b.score - a.score);
    setLeaderboard(data);
  }, []);

  const filtered = useMemo(() => {
    return leaderboard.filter(w => 
      w.name.toLowerCase().includes(search.toLowerCase()) || 
      w.id.toString().includes(search)
    );
  }, [leaderboard, search]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-12">
          <div className="animate-pulse space-y-8">
             <div className="h-12 bg-muted rounded-xl w-2/3 mx-auto mb-4" />
             <div className="h-4 bg-muted rounded-xl w-1/2 mx-auto" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                <div className="h-32 bg-muted rounded-xl" />
                <div className="h-32 bg-muted rounded-xl" />
                <div className="h-32 bg-muted rounded-xl" />
             </div>
             <div className="h-[400px] bg-muted rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">Madurai Transparency Portal</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Live metrics from all 100 wards. This data is updated hourly to provide an accurate representation of civic performance.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">City-wide SLA Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">89.4%</span>
                <Badge className="bg-green-100 text-green-700 border-none">+1.2%</Badge>
              </div>
              <Progress value={89.4} className="h-2" />
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Citizen Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">4.2/5</span>
                <Activity className="text-blue-500 h-6 w-6" />
              </div>
              <p className="text-xs text-muted-foreground">Based on 12,402 verified ratings</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Issues Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">45,921</span>
                <CheckCircle className="text-secondary h-6 w-6" />
              </div>
              <p className="text-xs text-muted-foreground">Since January 2024</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Ward Leaderboard</CardTitle>
                <CardDescription>Performance ranking of all 100 wards</CardDescription>
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
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>MCII Score</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead>SLA Compliance</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((w, i) => (
                  <TableRow key={w.id} className="cursor-pointer hover:bg-muted/30">
                    <TableCell className="font-bold">
                      {i < 3 ? (
                        <div className="flex items-center gap-2">
                          <Trophy className={`h-4 w-4 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : 'text-amber-700'}`} />
                          #{i + 1}
                        </div>
                      ) : (
                        `#${i + 1}`
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">Ward {w.id}</p>
                        <p className="text-xs text-muted-foreground">{w.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={w.score > 85 ? "default" : "outline"} className={w.score > 85 ? "bg-primary" : ""}>
                        {w.score}
                      </Badge>
                    </TableCell>
                    <TableCell>{w.resolved}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{w.compliance}%</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-secondary" style={{ width: `${w.compliance}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {w.trend === 'up' ? (
                        <ArrowUp className="inline h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="inline h-4 w-4 text-red-500" />
                      )}
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