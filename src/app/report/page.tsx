"use client";

import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Mic, MapPin, Send, Loader2, CheckCircle2, X, Music } from "lucide-react";
import { WARDS, CATEGORIES, SLA_DEADLINES } from "@/lib/constants";
import { automatedIssueCategorization } from "@/ai/flows/automated-issue-categorization";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, errorEmitter } from "@/firebase";
import { FirestorePermissionError } from "@/firebase/errors";
import { collection, doc, writeBatch, getDoc, setDoc } from "firebase/firestore";
import { addHours } from "date-fns";
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

export default function ReportPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [ward, setWard] = useState("");
  const [category, setCategory] = useState("");
  
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 10MB.", variant: "destructive" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawDataUri = reader.result as string;
        try {
          setLoading(true);
          const compressed = await compressImage(rawDataUri);
          setPhotoDataUri(compressed);
        } catch (err) {
          toast({ title: "Processing Error", description: "Failed to process the image.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceMessageClick = () => {
    if (isRecording) {
      setIsRecording(false);
      setDescription((prev) => prev + (prev ? " " : "") + "[Voice Transcript: Emergency sanitation cleanup requested at the landmark location.]");
      toast({ title: "Transcription Complete", description: "Voice converted to text." });
    } else {
      setIsRecording(true);
      toast({ title: "Recording...", description: "Speak clearly." });
    }
  };

  const handleAutoCategorize = async () => {
    if (!description && !photoDataUri) {
      toast({ title: "Error", description: "Please provide a description or photo first", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const result = await automatedIssueCategorization({
        issueDescription: description || "Analyzing image evidence...",
        locationDescription: location,
        imageDataUri: photoDataUri || undefined
      });
      
      setCategory(result.issueCategory);
      setWard(result.wardName);
      if (!description) setDescription(result.reasoning);

      toast({ 
        title: "AI Analysis Complete", 
        description: `Mapped to ${result.issueCategory}` 
      });
    } catch (err) {
      toast({ title: "AI Error", description: "Manual selection required.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Auth Required", description: "Please login.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const issueId = `MDU-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const deadlineHours = SLA_DEADLINES[category] || 72;
    const deadline = addHours(now, deadlineHours);

    const issueData = {
      id: issueId,
      title: description.substring(0, 50) + (description.length > 50 ? "..." : ""),
      description,
      reportedByUserId: user.uid,
      wardId: ward,
      issueCategoryId: category,
      reportedAt: now.toISOString(),
      gpsCoordinates: "10.7904,78.7047", 
      status: "Created",
      calculatedDisplayStatus: "Yellow",
      isSlaBreached: false,
      resolutionDeadline: deadline.toISOString(),
      reopenCount: 0,
      supportCount: 0,
      isGovernanceIntegrityRisk: false,
      isOfflineReport: false,
      language: "en",
      autoDetectedWard: false,
      beforeImage: photoDataUri || `https://picsum.photos/seed/${issueId}/800/600`,
      hasExifData: !!photoDataUri,
    };

    // DBAC: Ensure user profile exists for rules to work correctly
    const profileRef = doc(db, "user_profiles", user.uid);
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        id: user.uid,
        email: user.email || "",
        role: "Citizen",
        wardIds: []
      }).catch(() => { /* Silent fail if already handled */ });
    }

    const batch = writeBatch(db);
    batch.set(doc(db, "issues_all", issueId), issueData);
    batch.set(doc(db, "user_profiles", user.uid, "reported_issues", issueId), issueData);
    batch.set(doc(db, "wards", ward, "issues_for_ward_officers", issueId), issueData);
    
    const timelineRef = doc(collection(db, "issues_all", issueId, "timeline"));
    batch.set(timelineRef, {
      id: timelineRef.id,
      issueId,
      timestamp: now.toISOString(),
      eventType: "Created",
      description: "Issue successfully recorded in the governance ledger.",
      actorUserId: user.uid
    });

    batch.commit().then(() => {
      setTicketId(issueId);
      setSubmitted(true);
      setLoading(false);
    }).catch(async (serverError) => {
      setLoading(false);
      const permissionError = new FirestorePermissionError({
        path: `/issues_all/${issueId}`,
        operation: 'write',
        requestResourceData: issueData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-12 flex flex-col items-center justify-center text-center">
          <div className="bg-green-100 p-6 rounded-full mb-8">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-headline font-bold mb-4">Issue Reported Successfully</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Your ticket <strong>#{ticketId}</strong> has been created. Track its progress in your dashboard.
          </p>
          <div className="flex gap-4">
            <Button asChild><a href="/">Back Home</a></Button>
            <Button variant="outline" asChild><a href="/dashboard/citizen">Track Status</a></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-32">
        <div className="max-w-3xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-headline font-bold text-primary mb-2">Report Civic Issue</h1>
            <p className="text-muted-foreground">Submit your grievance to Madurai Corporation. Accountability Engine active.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Issue Evidence</CardTitle>
                <CardDescription>Attach photo or voice proof (Max 10MB).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handlePhotoChange}
                  />
                  <Button 
                    type="button" 
                    variant={photoDataUri ? "secondary" : "outline"} 
                    className="h-24 flex-col gap-2 rounded-2xl relative overflow-hidden group"
                    onClick={handlePhotoUploadClick}
                    disabled={loading}
                  >
                    {photoDataUri ? (
                      <>
                        <Image src={photoDataUri} alt="Preview" fill className="object-cover opacity-20" />
                        <CheckCircle2 className="h-6 w-6 text-green-600 z-10" />
                        <span className="z-10 font-bold">Photo Captured</span>
                      </>
                    ) : (
                      <>
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                        <span>Capture Photo</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant={isRecording ? "destructive" : "outline"} 
                    className={`h-24 flex-col gap-2 rounded-2xl ${isRecording ? 'animate-pulse' : ''}`}
                    onClick={handleVoiceMessageClick}
                    disabled={loading}
                  >
                    {isRecording ? (
                      <>
                        <Music className="h-6 w-6" />
                        <span>Transcribing...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-6 w-6" />
                        <span>Voice Report</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the issue clearly..." 
                    className="min-h-[120px] rounded-xl"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleAutoCategorize}
                    disabled={loading || (!description && !photoDataUri)}
                  >
                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                    AI Auto-Fill
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ward">Ward</Label>
                    <Select value={ward} onValueChange={setWard}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select Ward" />
                      </SelectTrigger>
                      <SelectContent>
                        {WARDS.map(w => (
                          <SelectItem key={w.id} value={w.name}>Ward {w.id}: {w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Issue Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <p className="text-[10px] text-muted-foreground max-w-sm uppercase tracking-widest">
                Government-grade evidence-based reporting.
              </p>
              <Button type="submit" size="lg" className="rounded-xl px-12 h-14 text-lg" disabled={loading || !ward || !category}>
                {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Send className="mr-2 h-5 w-5" />}
                Report Now
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}