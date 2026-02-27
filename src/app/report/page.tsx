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
import { useFirestore, useUser } from "@/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { addHours } from "date-fns";
import Image from "next/image";

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
  
  // Photo & Voice States
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceMessageClick = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate transcription
      setDescription((prev) => prev + (prev ? " " : "") + "[Voice Transcript: Large garbage overflow detected near the main junction. Immediate cleanup needed.]");
      toast({ title: "Transcription Complete", description: "Your voice message has been converted to text." });
    } else {
      setIsRecording(true);
      toast({ title: "Recording...", description: "Speak clearly. Click again to stop and transcribe." });
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
        issueDescription: description || "Analyzing uploaded photo...",
        locationDescription: location,
        imageDataUri: photoDataUri || undefined
      });
      
      setCategory(result.issueCategory);
      setWard(result.wardName);
      if (!description) setDescription(result.reasoning);

      toast({ 
        title: "AI Analysis Complete", 
        description: `Categorized as ${result.issueCategory} in ${result.wardName}` 
      });
    } catch (err) {
      toast({ title: "AI Error", description: "Failed to auto-categorize. Please select manually.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Auth Required", description: "Please login to report issues.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
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
        hasExifData: !!photoDataUri, // Simulated for the prototype
      };

      // 1. Master collection
      const masterRef = doc(db, "issues_all", issueId);
      batch.set(masterRef, issueData);

      // 2. Citizen scoped collection
      const citizenRef = doc(db, "user_profiles", user.uid, "reported_issues", issueId);
      batch.set(citizenRef, issueData);

      // 3. Ward scoped collection
      const wardRef = doc(db, "wards", ward, "issues_for_ward_officers", issueId);
      batch.set(wardRef, issueData);

      // 4. Initial Timeline Entry
      const timelineRef = doc(collection(db, "issues_all", issueId, "timeline"));
      batch.set(timelineRef, {
        id: timelineRef.id,
        issueId,
        timestamp: now.toISOString(),
        eventType: "Created",
        description: "Issue successfully reported and recorded in the governance ledger.",
        actorUserId: user.uid
      });

      await batch.commit();
      
      setTicketId(issueId);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
            Your ticket <strong>#{ticketId}</strong> has been created. An acknowledgement has been sent via SMS. You can track status in your dashboard.
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
            <p className="text-muted-foreground">Submit your grievance to Madurai Corporation. AI will auto-route it to the correct department.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Issue Evidence</CardTitle>
                <CardDescription>Attach visual or audio proof to accelerate resolution.</CardDescription>
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
                  >
                    {photoDataUri ? (
                      <>
                        <Image src={photoDataUri} alt="Preview" fill className="object-cover opacity-20 group-hover:opacity-40 transition-opacity" />
                        <CheckCircle2 className="h-6 w-6 text-green-600 z-10" />
                        <span className="z-10 font-bold">Photo Attached</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-6 w-6" />
                        <span>Upload Photo</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant={isRecording ? "destructive" : "outline"} 
                    className={`h-24 flex-col gap-2 rounded-2xl ${isRecording ? 'animate-pulse' : ''}`}
                    onClick={handleVoiceMessageClick}
                  >
                    {isRecording ? (
                      <>
                        <Music className="h-6 w-6" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-6 w-6" />
                        <span>Voice Message</span>
                      </>
                    )}
                  </Button>
                </div>

                {photoDataUri && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border">
                    <Image src={photoDataUri} alt="Preview" fill className="object-cover" />
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="absolute top-2 right-2 rounded-full h-8 w-8"
                      onClick={() => setPhotoDataUri(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="e.g. Large pothole near Arulmigu Meenakshi Amman Temple east gate..." 
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
                    Auto-Fill using AI
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Location & Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Landmark / Location Description</Label>
                  <div className="relative">
                    <Input 
                      id="location" 
                      placeholder="Street name, landmark..." 
                      className="rounded-xl pr-10"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

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
              <p className="text-xs text-muted-foreground max-w-sm">
                By submitting, you agree to the Madurai Civic Governance terms of service. Spam reporting is a punishable offence.
              </p>
              <Button type="submit" size="lg" className="rounded-xl px-12 h-14 text-lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Send className="mr-2 h-5 w-5" />}
                Submit Report
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}