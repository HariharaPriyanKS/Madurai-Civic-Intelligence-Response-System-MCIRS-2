"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { calculateDisplayStatus, isGovernanceIntegrityRisk } from "@/lib/issue-logic";
import { AlertCircle, History, Image as ImageIcon, MapPin, RefreshCcw, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration of the Evidence Engine
const MOCK_ISSUES = [
  {
    id: "MDU-9821",
    title: "Garbage Overflow",
    description: "Huge pile of trash near the temple entrance.",
    status: "ResolvedByOfficer",
    reportedAt: "2024-03-20T10:00:00Z",
    reopenCount: 0,
    isSlaBreached: false,
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
    beforeImage: "https://picsum.photos/seed/pothole/400/300",
    afterImage: null,
    proof: null // Missing proof!
  },
  {
    id: "MDU-1103",
    title: "Broken Streetlight",
    description: "Entire block is dark for 3 days.",
    status: "InProgress",
    reportedAt: "2024-03-22T08:00:00Z",
    reopenCount: 3, // Risk!
    isSlaBreached: true,
    beforeImage: "https://picsum.photos/seed/dark/400/300",
    afterImage: null,
    proof: null
  }
];

export default function CitizenDashboard() {
  const [issues, setIssues] = useState(MOCK_ISSUES);
  const { toast } = useToast();

  const handleReopen = (id: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === id) {
        const newReopenCount = issue.reopenCount + 1;
        return {
          ...issue,
          status: "Reopened",
          reopenCount: newReopenCount,
          isSlaBreached: false // Reset SLA on reopen
        };
      }
      return issue;
    }));
    toast({
      title: "Issue Reopened",
      description: "A notification has been sent to higher authorities for re-inspection.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">My Reported Issues</h1>
            <p className="text-muted-foreground">Monitor the progress and verify resolutions with mandatory proof.</p>
          </div>
          <Button size="lg" className="rounded-xl shadow-lg" asChild>
            <a href="/report">Report New Issue</a>
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {issues.map(issue => {
            const displayStatus = calculateDisplayStatus({
              internalStatus: issue.status,
              isSlaBreached: issue.isSlaBreached,
              reopenCount: issue.reopenCount,
              hasProof: !!issue.proof,
              isProofVerified: issue.proof?.isProofVerified || false
            });

            const isRisk = isGovernanceIntegrityRisk(issue.reopenCount);

            return (
              <Card key={issue.id} className="border-none shadow-xl overflow-hidden flex flex-col">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Ticket {issue.id}</span>
                    <StatusBadge status={displayStatus} />
                  </div>
                  <CardTitle className="text-2xl">{issue.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{issue.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-6 flex-grow">
                  {isRisk && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm font-bold">⚠ Governance Integrity Risk: Multiple Reopens detected.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground">Before Proof</p>
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                        <Image src={issue.beforeImage} alt="Before" fill className="object-cover" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground">After Proof (Mandatory)</p>
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                        {issue.afterImage ? (
                          <Image src={issue.afterImage} alt="After" fill className="object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                            <p className="text-[10px] text-muted-foreground">Awaiting Official Proof</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <History className="h-4 w-4" /> Resolution Timeline
                    </h4>
                    <div className="border-l-2 border-muted pl-4 space-y-4 ml-2">
                      <div className="relative">
                        <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-primary" />
                        <p className="text-xs font-bold">Reported on {new Date(issue.reportedAt).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">Issue logged in Madurai Central Ward.</p>
                      </div>
                      {issue.proof && (
                        <div className="relative">
                          <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-green-500" />
                          <p className="text-xs font-bold text-green-700">Proof Uploaded & Verified</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {issue.proof.geoCoordinates} • {new Date(issue.proof.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/10 border-t pt-4 flex gap-4">
                  {displayStatus === 'Green' ? (
                    <div className="w-full p-3 bg-green-50 text-green-700 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="h-4 w-4" /> Resolution Fully Verified
                    </div>
                  ) : (
                    <>
                      <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => handleReopen(issue.id)} disabled={issue.status === 'Reopened'}>
                        <RefreshCcw className="h-4 w-4 mr-2" /> Reopen Issue
                      </Button>
                      <Button className="flex-1 rounded-xl h-12">
                        Message Officer
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
