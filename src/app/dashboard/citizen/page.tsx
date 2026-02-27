"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PriorityBadge } from "@/components/dashboard/PriorityBadge";
import { calculateDisplayStatus, isGovernanceIntegrityRisk } from "@/lib/issue-logic";
import { calculateSeriousnessScore, getPriorityTag } from "@/lib/priority-logic";
import { AlertCircle, History, Image as ImageIcon, MapPin, RefreshCcw, CheckCircle2, ThumbsUp, Users, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

// Enhanced Mock Data with CSWPS Metrics
const MOCK_ISSUES = [
  {
    id: "MDU-9821",
    title: "Garbage Overflow",
    description: "Huge pile of trash near the temple entrance.",
    status: "ResolvedByOfficer",
    reportedAt: "2024-03-20T10:00:00Z",
    reopenCount: 0,
    isSlaBreached: false,
    supportCount: 45,
    viewCount: 120,
    wardIssueDensity: 0.8, // High recurrence hotspot
    beforeImage: "https://picsum.photos/seed/waste/400/300",
    afterImage: "https://picsum.photos/seed/clean/400/300",
    proof: {
      isProofVerified: true,
      geoCoordinates: "10.7904, 78.7047",
      timestamp: "2024-03-21T09:15:00Z"
    }
  },
  {
    id: "MDU-7722",
    title: "Deep Pothole",
    description: "Dangerous pothole in the middle of Main Street.",
    status: "ResolvedByOfficer",
    reportedAt: "2024-03-18T14:30:00Z",
    reopenCount: 1,
    isSlaBreached: false,
    supportCount: 12,
    viewCount: 85,
    wardIssueDensity: 0.4,
    beforeImage: "https://picsum.photos/seed/pothole/400/300",
    afterImage: null,
    proof: null
  },
  {
    id: "MDU-1103",
    title: "Broken Streetlight",
    description: "Entire block is dark for 3 days.",
    status: "InProgress",
    reportedAt: "2024-03-22T08:00:00Z",
    reopenCount: 3,
    isSlaBreached: true,
    supportCount: 89,
    viewCount: 310,
    wardIssueDensity: 0.9,
    beforeImage: "https://picsum.photos/seed/dark/400/300",
    afterImage: null,
    proof: null
  }
];

export default function CitizenDashboard() {
  const [issues, setIssues] = useState(MOCK_ISSUES);
  const { user } = useUser();
  const { toast } = useToast();

  const handleSupport = (id: string) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to support civic issues.", variant: "destructive" });
      return;
    }
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, supportCount: issue.supportCount + 1 } : issue
    ));
    toast({ title: "Issue Supported", description: "Your support has increased the seriousness score of this issue." });
  };

  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => {
      const scoreA = calculateSeriousnessScore({
        supportCount: a.supportCount,
        isSlaBreached: a.isSlaBreached,
        reopenCount: a.reopenCount,
        wardIssueDensity: a.wardIssueDensity,
        reportedAt: a.reportedAt
      });
      const scoreB = calculateSeriousnessScore({
        supportCount: b.supportCount,
        isSlaBreached: b.isSlaBreached,
        reopenCount: b.reopenCount,
        wardIssueDensity: b.wardIssueDensity,
        reportedAt: b.reportedAt
      });
      return scoreB - scoreA;
    });
  }, [issues]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Community Board</h1>
            <p className="text-muted-foreground">Democratic issue prioritization. Support issues to increase their resolution priority.</p>
          </div>
          <Button size="lg" className="rounded-xl shadow-lg" asChild>
            <a href="/report">Report New Issue</a>
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sortedIssues.map(issue => {
            const score = calculateSeriousnessScore({
              supportCount: issue.supportCount,
              isSlaBreached: issue.isSlaBreached,
              reopenCount: issue.reopenCount,
              wardIssueDensity: issue.wardIssueDensity,
              reportedAt: issue.reportedAt
            });
            const impact = getPriorityTag(score);

            const displayStatus = calculateDisplayStatus({
              internalStatus: issue.status,
              isSlaBreached: issue.isSlaBreached,
              reopenCount: issue.reopenCount,
              hasProof: !!issue.proof,
              isProofVerified: issue.proof?.isProofVerified || false
            });

            return (
              <Card key={issue.id} className="border-none shadow-xl overflow-hidden flex flex-col relative">
                {issue.supportCount > 50 && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold animate-bounce">
                    <TrendingUp className="h-3 w-3" /> TRENDING
                  </div>
                )}
                
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={displayStatus} />
                    <PriorityBadge impact={impact} score={score} />
                  </div>
                  <CardTitle className="text-2xl">{issue.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{issue.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-6 flex-grow">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                      <Image src={issue.beforeImage} alt="Before" fill className="object-cover" />
                    </div>
                    <div className="bg-muted/20 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-bold">{issue.supportCount}</span>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Citizen Supports</p>
                      <Button variant="ghost" size="sm" className="mt-4 gap-2 hover:bg-primary/10" onClick={() => handleSupport(issue.id)}>
                        <ThumbsUp className="h-4 w-4" /> Support Issue
                      </Button>
                    </div>
                  </div>

                  {isGovernanceIntegrityRisk(issue.reopenCount) && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm font-bold">⚠ Governance Integrity Risk: Priority Escalated.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                       <MapPin className="h-3 w-3" /> Ward {issue.id.split('-')[1]}
                    </div>
                    <div>{issue.viewCount} Views</div>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/10 border-t pt-4">
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <a href={`/issues/${issue.id}`}>View Resolution Timeline</a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
