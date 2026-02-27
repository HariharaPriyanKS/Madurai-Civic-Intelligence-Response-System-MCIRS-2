
"use client";

import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PriorityBadge } from "@/components/dashboard/PriorityBadge";
import { calculateDisplayStatus } from "@/lib/issue-logic";
import { calculateSeriousnessScore, getPriorityTag } from "@/lib/priority-logic";
import { MapPin, Calendar, Clock, CheckCircle2, History, Image as ImageIcon, Loader2, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { collection, query, orderBy } from "firebase/firestore";

export default function IssueDetailPage() {
  const { id } = useParams();
  const db = useFirestore();

  const issueRef = useMemoFirebase(() => doc(db, "issues_all", id as string), [db, id]);
  const { data: issue, isLoading: isIssueLoading } = useDoc(issueRef);

  const timelineRef = useMemoFirebase(() => {
    if (!id) return null;
    return collection(db, "issues_all", id as string, "timeline");
  }, [db, id]);

  const timelineQuery = useMemoFirebase(() => {
    if (!timelineRef) return null;
    return query(timelineRef, orderBy("timestamp", "desc"));
  }, [timelineRef]);

  const { data: timeline, isLoading: isTimelineLoading } = useCollection(timelineQuery);

  if (isIssueLoading || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const score = calculateSeriousnessScore({
    supportCount: issue.supportCount || 0,
    isSlaBreached: issue.isSlaBreached || false,
    reopenCount: issue.reopenCount || 0,
    wardIssueDensity: 0.5,
    reportedAt: issue.reportedAt
  });

  const displayStatus = calculateDisplayStatus({
    internalStatus: issue.status,
    isSlaBreached: issue.isSlaBreached || false,
    reopenCount: issue.reopenCount || 0,
    hasProof: !!issue.resolutionProofId,
    isProofVerified: issue.isProofVerified || false
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <header>
              <div className="flex items-center gap-4 mb-4">
                <StatusBadge status={displayStatus} />
                <PriorityBadge impact={getPriorityTag(score)} score={score} />
                <Badge variant="outline">Ticket #{issue.id}</Badge>
              </div>
              <h1 className="text-4xl font-headline font-bold text-primary mb-2">{issue.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {issue.wardId}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Reported {new Date(issue.reportedAt).toLocaleDateString()}</span>
              </div>
            </header>

            <Card className="border-none shadow-xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle>Issue Evidence</CardTitle>
                <CardDescription>Mandatory before & after proof comparison</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Before (Reported)</p>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                      <Image 
                        src={issue.beforeImage || "https://picsum.photos/seed/before/800/600"} 
                        alt="Initial Report" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">After (Resolution Proof)</p>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted border-2 border-dashed flex items-center justify-center">
                      {issue.status === 'ResolvedByOfficer' || issue.status === 'Closed' ? (
                        <Image 
                          src={`https://picsum.photos/seed/${issue.id}-after/800/600`} 
                          alt="Resolution Proof" 
                          fill 
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-center text-muted-foreground p-8">
                          <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Pending Resolution Proof</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                   <h4 className="font-bold mb-2">Description</h4>
                   <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Resolution Timeline
                </CardTitle>
                <CardDescription>Chronological audit log of all actions taken on this ticket.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {timeline?.map((entry, i) => (
                    <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-900">{entry.eventType}</div>
                          <time className="font-mono text-xs text-primary">{new Date(entry.timestamp).toLocaleTimeString()}</time>
                        </div>
                        <div className="text-slate-500 text-sm">{entry.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             <Card className="border-none shadow-xl bg-primary text-white">
                <CardHeader>
                  <CardTitle>Governance Integrity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span>SLA Deadline</span>
                    <span className="font-mono">{new Date(issue.resolutionDeadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Support Count</span>
                    <span className="font-bold text-2xl">{issue.supportCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Reopen Count</span>
                    <span className="font-bold">{issue.reopenCount || 0}</span>
                  </div>
                  {issue.reopenCount > 2 && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                       <AlertTriangle className="h-5 w-5" />
                       <span className="text-[10px] font-bold uppercase">Governance Risk Flagged</span>
                    </div>
                  )}
                </CardContent>
             </Card>

             <Card className="border-none shadow-xl">
               <CardHeader>
                 <CardTitle>Assigned Official</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold">Sanitation Officer</p>
                      <p className="text-xs text-muted-foreground">Madurai Corporation Zone 3</p>
                    </div>
                  </div>
               </CardContent>
             </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

import { doc } from "firebase/firestore";
