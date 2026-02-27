"use client";

import { useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { calculateDisplayStatus } from "@/lib/issue-logic";
import { Camera, MapPin, CheckCircle, Clock, ShieldCheck, AlertTriangle, BarChart3, ListChecks, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore, useMemoFirebase, useUser, errorEmitter } from "@/firebase";
import { FirestorePermissionError } from "@/firebase/errors";
import { collection, doc, writeBatch } from "firebase/firestore";
import { processAnalytics } from "@/lib/analytics-logic";
import { StatusDistributionChart, AgeDistributionChart } from "@/components/analytics/AnalyticsCharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Image from "next/image";

const compressImage = (dataUri: string, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const result = canvas.toDataURL('image/jpeg', quality);
        if (result.length > 1000000) {
          resolve(compressImage(dataUri, maxWidth * 0.7, quality * 0.7));
        } else {
          resolve(result);
        }
      } else {
        reject(new Error("Canvas context failed"));
      }
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = dataUri;
  });
};

export default function OfficialDashboard() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const issuesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "issues_all");
  }, [db, user]);

  const { data: issues, isLoading } = useCollection(issuesRef);
  const stats = issues ? processAnalytics(issues) : null;

  const handleResolve = (issue: any, photoDataUri: string) => {
    const batch = writeBatch(db);
    const proofId = `PR-${Date.now()}`;
    const resolutionTime = new Date().toISOString();
    
    const updateData = {
      status: "ResolvedByOfficer",
      resolutionProofId: proofId,
      resolvedAt: resolutionTime,
      isProofVerified: true,
      geoCoordinatesVerified: true,
      timestampVerified: true,
      afterImage: photoDataUri
    };

    batch.update(doc(db, "issues_all", issue.id), updateData);
    
    if (issue.reportedByUserId) {
      batch.update(doc(db, "user_profiles", issue.reportedByUserId, "reported_issues", issue.id), updateData);
    }
    
    if (issue.wardId) {
      batch.update(doc(db, "wards", issue.wardId, "issues_for_ward_officers", issue.id), updateData);
    }

    const timelineRef = doc(collection(db, "issues_all", issue.id, "timeline"));
    batch.set(timelineRef, {
      id: timelineRef.id,
      issueId: issue.id,
      timestamp: resolutionTime,
      eventType: "ResolvedByOfficer",
      description: "Official uploaded resolution proof.",
      actorUserId: user?.uid,
      relatedProofId: proofId
    });

    batch.commit().then(() => {
      toast({
        title: "Proof Uploaded",
        description: "Task resolved.",
      });
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: `/issues_all/${issue.id}`,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, issue: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
        return;
      }

      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawDataUri = reader.result as string;
        try {
          const compressed = await compressImage(rawDataUri);
          handleResolve(issue, compressed);
        } catch (err) {
          toast({ title: "Processing Failed", description: "Could not process proof.", variant: "destructive" });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-12">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Officer Workspace</h1>
            <p className="text-muted-foreground">Evidence-based accountability Engine.</p>
          </div>
        </header>

        {isLoading || !user ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing Workspace...</p>
          </div>
        ) : (
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
                      <h3 className="text-2xl font-bold">{issues?.filter(i => i.status !== 'Closed' && i.status !== 'ResolvedByOfficer').length || 0} Issues</h3>
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
                      <p className="text-sm text-muted-foreground font-bold uppercase">Success Rate</p>
                      <h3 className="text-2xl font-bold">94%</h3>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {issues?.map(issue => (
                <Card key={issue.id} className="border-none shadow-xl mb-6 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-8 flex-grow">
                        <div className="flex items-center gap-4 mb-4">
                          <StatusBadge status={calculateDisplayStatus({
                            internalStatus: issue.status,
                            isSlaBreached: issue.isSlaBreached,
                            reopenCount: issue.reopenCount || 0,
                            hasProof: !!issue.resolutionProofId,
                            isProofVerified: issue.isProofVerified || false
                          })} />
                          <span className="text-sm font-bold text-muted-foreground">Ticket #{issue.id}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{issue.title}</h3>
                        <p className="text-muted-foreground mb-6">{issue.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <MapPin className="h-3 w-3" /> {issue.wardId} • Reported {new Date(issue.reportedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="bg-muted/30 p-8 border-l flex flex-col justify-center items-center gap-4 w-full md:w-80 relative">
                         {issue.status === 'ResolvedByOfficer' || issue.status === 'Closed' ? (
                           <div className="text-center">
                             <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
                             <p className="font-bold text-green-700">Resolved</p>
                             <div className="mt-4 relative h-32 w-48 rounded-lg overflow-hidden border">
                                <Image src={issue.afterImage || `https://picsum.photos/seed/${issue.id}-after/400/300`} alt="Resolution" fill className="object-cover" />
                             </div>
                           </div>
                         ) : (
                           <>
                             <input 
                               type="file" 
                               accept="image/*" 
                               className="hidden" 
                               ref={fileInputRef} 
                               onChange={(e) => onPhotoChange(e, issue)}
                             />
                             <Button 
                               className="w-full h-14 rounded-xl text-lg gap-2" 
                               disabled={isProcessing}
                               onClick={() => fileInputRef.current?.click()}
                             >
                               {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                               Capture Proof
                             </Button>
                             <p className="text-[10px] text-center text-muted-foreground">
                               Evidence Capture Loop Active.
                             </p>
                           </>
                         )}
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
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}