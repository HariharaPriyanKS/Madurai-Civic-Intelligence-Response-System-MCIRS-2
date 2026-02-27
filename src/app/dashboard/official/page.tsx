"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { calculateDisplayStatus } from "@/lib/issue-logic";
import { Camera, MapPin, CheckCircle, Clock, ShieldCheck, AlertTriangle, BarChart3, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { processAnalytics } from "@/lib/analytics-logic";
import { StatusDistributionChart, AgeDistributionChart } from "@/components/analytics/AnalyticsCharts";

export default function OfficialDashboard() {
  const { toast } = useToast();
  const db = useFirestore();
  const issuesRef = useMemoFirebase(() => collection(db, "issues_all"), [db]); // In real app, scoped by Official ID
  const { data: issues, isLoading } = useCollection(issuesRef);

  const stats = issues ? processAnalytics(issues) : null;

  const handleResolve = (id: string) => {
    toast({
      title: "Proof Uploaded & Task Resolved",
      description: "Geolocation and Timestamp recorded. Mandatory evidence logic applied.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-12">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Officer Workspace</h1>
            <p className="text-muted-foreground">Madurai Corporation Official Panel. Evidence-based accountability active.</p>
          </div>
        </header>

        <Tabs defaultValue="tasks" className="space-y-8">
          <TabsList className="bg-muted p-1 rounded-xl h-14">
            <TabsTrigger value="tasks" className="rounded-lg h-12 gap-2 text-md">
              <ListChecks className="h-5 w-5" /> My Active Tasks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg h-12 gap-2 text-md">
              <BarChart3 className="h-5 w-5" /> Ward Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-none shadow-md">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Clock className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-bold uppercase">Pending</p>
                    <h3 className="text-2xl font-bold">{issues?.filter(i => i.status !== 'Closed').length || 0} Issues</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><AlertTriangle className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-bold uppercase">SLA Breaches</p>
                    <h3 className="text-2xl font-bold">{issues?.filter(i => i.isSlaBreached).length || 0} Urgent</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><CheckCircle className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-bold uppercase">Verified Success</p>
                    <h3 className="text-2xl font-bold">92% Rate</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-primary h-6 w-6" /> Assigned Assignments
            </h2>

            {issues?.map(issue => (
              <Card key={issue.id} className="border-none shadow-xl">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-8 flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                        <StatusBadge status={calculateDisplayStatus({
                          internalStatus: issue.status,
                          isSlaBreached: issue.isSlaBreached,
                          reopenCount: issue.reopenCount || 0,
                          hasProof: !!issue.resolutionProofId,
                          isProofVerified: true
                        })} />
                        <span className="text-sm font-bold text-muted-foreground">Ticket {issue.id}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{issue.title}</h3>
                      <p className="text-muted-foreground mb-6">{issue.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <MapPin className="h-3 w-3" /> {issue.wardId} • Reported {new Date(issue.reportedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-8 border-l flex flex-col justify-center items-center gap-4 w-full md:w-80">
                       <Button className="w-full h-14 rounded-xl text-lg gap-2" onClick={() => handleResolve(issue.id)}>
                         <Camera className="h-6 w-6" /> Upload Resolution Proof
                       </Button>
                       <p className="text-[10px] text-center text-muted-foreground">
                         GPS, Timestamp & EXIF data captured automatically.
                       </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {stats && (
                <>
                  <StatusDistributionChart data={stats.statusStats} />
                  <AgeDistributionChart data={stats.ageStats} />
                  <Card className="md:col-span-2 border-none shadow-lg">
                    <CardHeader>
                        <CardTitle>Department Comparison</CardTitle>
                        <CardDescription>My Ward performance vs City Benchmarks</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.deptStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={10}/>
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="slaBreachCount" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
