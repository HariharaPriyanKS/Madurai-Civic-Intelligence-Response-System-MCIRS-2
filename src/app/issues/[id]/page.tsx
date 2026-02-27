
"use client";

import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PriorityBadge } from "@/components/dashboard/PriorityBadge";
import { calculateDisplayStatus } from "@/lib/issue-logic";
import { calculateSeriousnessScore, getPriorityTag } from "@/lib/priority-logic";
import { MapPin, Calendar, Clock, CheckCircle2, History, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { useState, useEffect } from "react";

export default function IssueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) return null;

  if (isIssueLoading || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 mx-auto mb-4" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Retrieving Governance Audit...</p>
        </div>
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
        <Button variant="ghost" onClick={() => router.back()} className="mb-8 rounded-xl gap-2 hover:bg-primary/5 text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <header>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <StatusBadge status={displayStatus} />
                <PriorityBadge impact={getPriorityTag(score)} score={score} />
                <Badge variant="outline" className="rounded-lg border-2">Ticket #{issue.id}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2 tracking-tight">{issue.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-medium">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {issue.wardId}</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Reported {new Date(issue.reportedAt).toLocaleDateString()}</span>
              </div>
            </header>

            <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
              <CardHeader className="bg-muted/30 border-b p-8">
                <CardTitle className="text-2xl font-bold">Evidence Comparison</CardTitle>
                <CardDescription>Mandatory visual proof required for accountability</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Before (Initial Report)</p>
                    <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted shadow-inner border">
                      <Image 
                        src={issue.beforeImage || `https://picsum.photos/seed/${issue.id}-before/800/800`} 
                        alt="Initial Report" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">After (Resolution Proof)</p>
                    <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted border-2 border-dashed flex items-center justify-center">
                      {issue.status === 'ResolvedByOfficer' || issue.status === 'Closed' ? (
                        <Image 
                          src={issue.afterImage || `https://picsum.photos/seed/${issue.id}-after/800/800`} 
                          alt="Resolution Proof" 
                          fill 
                          className="object-cover animate-in fade-in zoom-in duration-500"
                        />
                      ) : (
                        <div className="text-center text-muted-foreground p-8 opacity-40">
                          <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
                          <p className="font-bold text-lg">Resolution Pending</p>
                          <p className="text-xs max-w-[160px] mx-auto mt-2">Officer must upload after-photo to complete the loop.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-12 p-8 bg-primary/5 rounded-3xl border border-primary/10">
                   <h4 className="font-bold text-lg mb-4 text-primary flex items-center gap-2">
                     <Clock className="h-5 w-5" /> Detailed Description
                   </h4>
                   <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg italic">
                    "{issue.description}"
                   </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl rounded-3xl">
              <CardHeader className="p-8 border-b bg-muted/20">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                  <History className="h-6 w-6 text-primary" />
                  Governance Audit Timeline
                </CardTitle>
                <CardDescription>Chronological sequence of administrative actions.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {timeline?.map((entry, i) => (
                    <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl border-4 border-white bg-slate-200 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-transform hover:scale-110">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3.5rem)] bg-white p-6 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between space-x-2 mb-2">
                          <div className="font-black text-slate-900 uppercase tracking-tight">{entry.eventType}</div>
                          <time className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">{new Date(entry.timestamp).toLocaleTimeString()}</time>
                        </div>
                        <div className="text-slate-500 text-sm leading-relaxed">{entry.description}</div>
                      </div>
                    </div>
                  ))}
                  {timeline?.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground opacity-40">
                      <History className="h-12 w-12 mx-auto mb-4 animate-spin-slow" />
                      <p className="font-bold">Initializing Resolution Log...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             <Card className="border-none shadow-2xl bg-primary text-white rounded-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                   <ShieldCheck className="h-24 w-24" />
                </div>
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-bold">Integrity Score</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                    <span className="opacity-70 font-medium">SLA Deadline</span>
                    <span className="font-mono font-bold">{new Date(issue.resolutionDeadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Support Ranking</p>
                      <h3 className="text-5xl font-black mt-1">{issue.supportCount || 0}</h3>
                    </div>
                    <Badge className="bg-white/20 text-white border-none rounded-lg px-3 py-1 mb-1">
                      City High
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-70 font-medium">Reopen Frequency</span>
                    <span className="font-bold text-xl">{issue.reopenCount || 0}</span>
                  </div>
                  {issue.reopenCount > 2 && (
                    <div className="p-4 bg-red-500/30 border border-white/20 rounded-2xl flex items-center gap-3 animate-pulse">
                       <AlertTriangle className="h-6 w-6 text-white" />
                       <span className="text-xs font-black uppercase tracking-tighter leading-none">High Governance <br/>Risk Flagged</span>
                    </div>
                  )}
                </CardContent>
             </Card>

             <Card className="border-none shadow-2xl rounded-3xl p-4">
               <CardHeader>
                 <CardTitle className="text-xl font-bold">Officer Assigned</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <UserCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 leading-none">Ward Executive</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Zone 3 • Ward {issue.wardId}</p>
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

function UserCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
