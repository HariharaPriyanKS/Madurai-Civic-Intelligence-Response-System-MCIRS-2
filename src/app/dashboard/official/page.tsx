"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { calculateDisplayStatus } from "@/lib/issue-logic";
import { Camera, MapPin, CheckCircle, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_ASSIGNED_ISSUES = [
  {
    id: "MDU-7722",
    title: "Deep Pothole",
    description: "Main Street, block 4. Dangerous for two-wheelers.",
    status: "InProgress",
    reportedAt: "2024-03-18T14:30:00Z",
    reopenCount: 1,
    isSlaBreached: false,
    proofUploaded: false
  },
  {
    id: "MDU-4491",
    title: "Streetlight Repair",
    description: "Ward 12, Sub-station area.",
    status: "Acknowledged",
    reportedAt: "2024-03-21T11:00:00Z",
    reopenCount: 0,
    isSlaBreached: false,
    proofUploaded: false
  }
];

export default function OfficialDashboard() {
  const [issues, setIssues] = useState(MOCK_ASSIGNED_ISSUES);
  const { toast } = useToast();

  const handleResolve = (id: string) => {
    // In a real app, this would trigger camera/location permission and upload
    setIssues(prev => prev.map(issue => {
      if (issue.id === id) {
        return {
          ...issue,
          status: "ResolvedByOfficer",
          proofUploaded: true,
          proofVerified: true // Simulation
        };
      }
      return issue;
    }));
    toast({
      title: "Proof Uploaded & Task Resolved",
      description: "Geolocation and Timestamp recorded. Mandatory evidence logic applied.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-12">
        <header className="mb-10">
          <h1 className="text-4xl font-headline font-bold text-primary">Officer Task Manager</h1>
          <p className="text-muted-foreground">Madurai Corporation Official Workspace. Evidence-based closure required.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-none shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Clock className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-muted-foreground font-bold uppercase">Pending</p>
                <h3 className="text-2xl font-bold">12 Issues</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><AlertTriangle className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-muted-foreground font-bold uppercase">SLA Breach Risk</p>
                <h3 className="text-2xl font-bold">2 Issues</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><CheckCircle className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-muted-foreground font-bold uppercase">Completed (Verified)</p>
                <h3 className="text-2xl font-bold">84% Rate</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
          <ShieldCheck className="text-primary h-6 w-6" /> Active Assignments
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {issues.map(issue => {
            const displayStatus = calculateDisplayStatus({
              internalStatus: issue.status,
              isSlaBreached: issue.isSlaBreached,
              reopenCount: issue.reopenCount,
              hasProof: issue.proofUploaded,
              isProofVerified: true // Mocked
            });

            return (
              <Card key={issue.id} className="border-none shadow-xl">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-8 flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                        <StatusBadge status={displayStatus} />
                        <span className="text-sm font-bold text-muted-foreground">Ticket {issue.id}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{issue.title}</h3>
                      <p className="text-muted-foreground mb-6">{issue.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" /> Reported {new Date(issue.reportedAt).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" /> GPS Tag Mandatory on Closure
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-8 border-l flex flex-col justify-center items-center gap-4 w-full md:w-80">
                      {issue.proofUploaded ? (
                        <div className="text-center">
                          <div className="bg-green-100 text-green-700 p-4 rounded-full mb-4 mx-auto w-fit">
                            <CheckCircle className="h-8 w-8" />
                          </div>
                          <p className="font-bold text-green-700">Resolution Logged</p>
                          <p className="text-xs text-muted-foreground">Proof verified by AI Engine</p>
                        </div>
                      ) : (
                        <>
                          <Button className="w-full h-14 rounded-xl text-lg gap-2" onClick={() => handleResolve(issue.id)}>
                            <Camera className="h-6 w-6" /> Upload Resolution Proof
                          </Button>
                          <p className="text-[10px] text-center text-muted-foreground">
                            System will auto-capture GPS, Timestamp & EXIF data for governance audit.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
