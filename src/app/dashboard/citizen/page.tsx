"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PriorityBadge } from "@/components/dashboard/PriorityBadge";
import { calculateDisplayStatus, isGovernanceIntegrityRisk } from "@/lib/issue-logic";
import { calculateSeriousnessScore, getPriorityTag } from "@/lib/priority-logic";
import { AlertCircle, History, Image as ImageIcon, MapPin, RefreshCcw, CheckCircle2, ThumbsUp, Users, TrendingUp, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter } from "@/firebase";
import { FirestorePermissionError } from "@/firebase/errors";
import { collection, doc, writeBatch, increment } from "firebase/firestore";

export default function CitizenDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSupporting, setIsSupporting] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const issuesRef = useMemoFirebase(() => {
    return collection(db, "issues_all");
  }, [db]);

  const { data: issues, isLoading } = useCollection(issuesRef);

  const handleSupport = (issue: any) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please login.", variant: "destructive" });
      return;
    }
    
    setIsSupporting(issue.id);
    const batch = writeBatch(db);
    const masterRef = doc(db, "issues_all", issue.id);
    batch.update(masterRef, { supportCount: increment(1) });
    
    if (issue.reportedByUserId) {
      const citizenRef = doc(db, "user_profiles", issue.reportedByUserId, "reported_issues", issue.id);
      batch.update(citizenRef, { supportCount: increment(1) });
    }
    
    if (issue.wardId) {
      const wardRef = doc(db, "wards", issue.wardId, "issues_for_ward_officers", issue.id);
      batch.update(wardRef, { supportCount: increment(1) });
    }

    if (issue.assignedToUserId) {
      const assignedRef = doc(db, "user_profiles", issue.assignedToUserId, "assigned_issues", issue.id);
      batch.update(assignedRef, { supportCount: increment(1) });
    }

    const timelineRef = doc(collection(db, "issues_all", issue.id, "timeline"));
    batch.set(timelineRef, {
      id: timelineRef.id,
      issueId: issue.id,
      timestamp: new Date().toISOString(),
      eventType: "SupportAdded",
      description: "A citizen supported this issue.",
      actorUserId: user.uid
    });

    batch.commit()
      .then(() => {
        toast({ title: "Issue Supported", description: "Impact increased." });
        setIsSupporting(null);
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: masterRef.path,
          operation: 'update',
          requestResourceData: { supportCount: 'increment' },
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSupporting(null);
      });
  };

  const sortedIssues = useMemo(() => {
    if (!issues) return [];
    return [...issues].sort((a, b) => {
      const scoreA = calculateSeriousnessScore({
        supportCount: a.supportCount || 0,
        isSlaBreached: a.isSlaBreached || false,
        reopenCount: a.reopenCount || 0,
        wardIssueDensity: 0.5,
        reportedAt: a.reportedAt
      });
      const scoreB = calculateSeriousnessScore({
        supportCount: b.supportCount || 0,
        isSlaBreached: b.isSlaBreached || false,
        reopenCount: b.reopenCount || 0,
        wardIssueDensity: 0.5,
        reportedAt: b.reportedAt
      });
      return scoreB - scoreA;
    });
  }, [issues]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-32">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Community Board</h1>
            <p className="text-muted-foreground">Impact-driven governance dashboard for Madurai Citizens.</p>
          </div>
          <Button size="lg" className="rounded-xl shadow-lg h-14 px-8" asChild>
            <a href="/report">Report New Issue</a>
          </Button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Synchronizing Community Feed...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sortedIssues.map(issue => {
              const score = calculateSeriousnessScore({
                supportCount: issue.supportCount || 0,
                isSlaBreached: issue.isSlaBreached || false,
                reopenCount: issue.reopenCount || 0,
                wardIssueDensity: 0.5,
                reportedAt: issue.reportedAt
              });
              const impact = getPriorityTag(score);

              const displayStatus = calculateDisplayStatus({
                internalStatus: issue.status,
                isSlaBreached: issue.isSlaBreached || false,
                reopenCount: issue.reopenCount || 0,
                hasProof: !!issue.resolutionProofId,
                isProofVerified: issue.isProofVerified || false
              });

              return (
                <Card key={issue.id} className="border-none shadow-xl overflow-hidden flex flex-col relative group hover:ring-2 ring-primary/20 transition-all">
                  {(issue.supportCount || 0) > 10 && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold animate-bounce shadow-sm">
                      <TrendingUp className="h-3 w-3" /> TRENDING
                    </div>
                  )}
                  
                  <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <StatusBadge status={displayStatus} />
                      <PriorityBadge impact={impact} score={score} />
                    </div>
                    <CardTitle className="text-2xl font-headline">{issue.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{issue.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6 flex-grow">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted shadow-inner">
                        <Image src={issue.beforeImage || `https://picsum.photos/seed/${issue.id}/400/300`} alt="Before" fill className="object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <div className="bg-primary/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-primary/10">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="h-6 w-6 text-primary" />
                          <span className="text-3xl font-bold text-primary">{issue.supportCount || 0}</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Public Supports</p>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="mt-6 w-full rounded-xl gap-2 h-10 shadow-sm"
                          disabled={isSupporting === issue.id}
                          onClick={() => handleSupport(issue)}
                        >
                          {isSupporting === issue.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                          Support Issue
                        </Button>
                      </div>
                    </div>

                    {isGovernanceIntegrityRisk(issue.reopenCount || 0) && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 shadow-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span className="text-xs font-bold uppercase">Critical Governance Integrity Risk Detected.</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em] border-t pt-4">
                      <div className="flex items-center gap-2">
                         <MapPin className="h-3 w-3 text-primary" /> {issue.wardId}
                      </div>
                      <div className="flex items-center gap-1">
                        <RefreshCcw className="h-3 w-3" /> Reopens: {issue.reopenCount || 0}
                      </div>
                      <div>Ticket #{issue.id}</div>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/10 border-t p-4">
                    <Button variant="ghost" className="w-full rounded-xl gap-2 h-12 text-primary hover:bg-primary/5" asChild>
                      <a href={`/issues/${issue.id}`}>
                        View Resolution Timeline <ArrowRight className="h-4 w-4" />
                      </a>
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
