
"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PriorityBadge } from "@/components/dashboard/PriorityBadge";
import { calculateDisplayStatus, isGovernanceIntegrityRisk } from "@/lib/issue-logic";
import { calculateSeriousnessScore, getPriorityTag } from "@/lib/priority-logic";
import { AlertCircle, History, Image as ImageIcon, MapPin, RefreshCcw, CheckCircle2, ThumbsUp, Users, TrendingUp, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, increment } from "firebase/firestore";

export default function CitizenDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const issuesRef = useMemoFirebase(() => {
    // In real prod, this should be scoped to current user or ward
    return collection(db, "issues_all");
  }, [db]);

  const { data: issues, isLoading } = useCollection(issuesRef);

  const handleSupport = async (id: string) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to support civic issues.", variant: "destructive" });
      return;
    }
    
    try {
      const issueRef = doc(db, "issues_all", id);
      // Atomic increment for CSWPS integrity
      await updateDoc(issueRef, {
        supportCount: increment(1)
      });
      toast({ title: "Issue Supported", description: "Your support has increased the seriousness score of this issue." });
    } catch (err: any) {
      toast({ title: "Action Failed", description: err.message, variant: "destructive" });
    }
  };

  const sortedIssues = useMemo(() => {
    if (!issues) return [];
    return [...issues].sort((a, b) => {
      const scoreA = calculateSeriousnessScore({
        supportCount: a.supportCount || 0,
        isSlaBreached: a.isSlaBreached || false,
        reopenCount: a.reopenCount || 0,
        wardIssueDensity: a.wardIssueDensity || 0.5,
        reportedAt: a.reportedAt
      });
      const scoreB = calculateSeriousnessScore({
        supportCount: b.supportCount || 0,
        isSlaBreached: b.isSlaBreached || false,
        reopenCount: b.reopenCount || 0,
        wardIssueDensity: b.wardIssueDensity || 0.5,
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Civic Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sortedIssues.map(issue => {
              const score = calculateSeriousnessScore({
                supportCount: issue.supportCount || 0,
                isSlaBreached: issue.isSlaBreached || false,
                reopenCount: issue.reopenCount || 0,
                wardIssueDensity: issue.wardIssueDensity || 0.5,
                reportedAt: issue.reportedAt
              });
              const impact = getPriorityTag(score);

              const displayStatus = calculateDisplayStatus({
                internalStatus: issue.status,
                isSlaBreached: issue.isSlaBreached || false,
                reopenCount: issue.reopenCount || 0,
                hasProof: !!issue.resolutionProofId,
                isProofVerified: true // Assuming verified for demo
              });

              return (
                <Card key={issue.id} className="border-none shadow-xl overflow-hidden flex flex-col relative">
                  {(issue.supportCount || 0) > 50 && (
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
                        <Image src={issue.beforeImage || "https://picsum.photos/seed/issue/400/300"} alt="Before" fill className="object-cover" />
                      </div>
                      <div className="bg-muted/20 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-5 w-5 text-primary" />
                          <span className="text-2xl font-bold">{issue.supportCount || 0}</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Citizen Supports</p>
                        <Button variant="ghost" size="sm" className="mt-4 gap-2 hover:bg-primary/10" onClick={() => handleSupport(issue.id)}>
                          <ThumbsUp className="h-4 w-4" /> Support Issue
                        </Button>
                      </div>
                    </div>

                    {isGovernanceIntegrityRisk(issue.reopenCount || 0) && (
                      <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-bold">⚠ Governance Integrity Risk: Priority Escalated.</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                         <MapPin className="h-3 w-3" /> {issue.wardId}
                      </div>
                      <div>{issue.viewCount || 0} Views</div>
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
        )}
      </div>
    </div>
  );
}
