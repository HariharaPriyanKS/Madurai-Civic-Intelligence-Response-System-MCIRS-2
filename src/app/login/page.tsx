
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { ShieldCheck, Loader2, LogIn, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back", description: "Identity verified." });
      router.push("/dashboard");
    } catch (err: any) {
      toast({ title: "Login Failed", description: "Invalid credentials for MCIRS.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'Official' | 'Authority' | 'Citizen') => {
    setLoading(true);
    const demoEmail = role === 'Official' ? 'official@mcirs.gov.in' : 
                      role === 'Authority' ? 'commissioner@mcirs.gov.in' : 
                      'citizen@mcirs.gov.in';
    
    try {
      // In a real prototype, we'd sign in with these. For now, we simulate or use anonymous
      // But to satisfy the DashboardRouter's email logic, we'll try actual sign in
      await signInWithEmailAndPassword(auth, demoEmail, "password123");
      router.push("/dashboard");
    } catch (err) {
      // Fallback to anonymous if demo accounts aren't provisioned yet
      await signInAnonymously(auth);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-40 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
            <CardHeader className="text-center bg-primary/5 pb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20">
                  <ShieldCheck className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-3xl font-headline font-bold">Officer Access</CardTitle>
              <CardDescription>Secure Gateway for Madurai Corporation</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Official Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="name@mcirs.gov.in" 
                    className="rounded-xl h-12" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Security Code</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    className="rounded-xl h-12" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full h-14 rounded-xl text-lg font-bold shadow-lg gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                  Authorize Entry
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  <span className="bg-background px-4">Demo Rapid Access</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="h-12 rounded-xl justify-start gap-3 hover:bg-primary/5" onClick={() => handleDemoLogin('Official')}>
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><UserCircle className="h-4 w-4" /></div>
                  Official Dashboard (Ward Officer)
                </Button>
                <Button variant="outline" className="h-12 rounded-xl justify-start gap-3 hover:bg-primary/5" onClick={() => handleDemoLogin('Authority')}>
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><ShieldCheck className="h-4 w-4" /></div>
                  Authority View (Commissioner)
                </Button>
                <Button variant="outline" className="h-12 rounded-xl justify-start gap-3 hover:bg-primary/5" onClick={() => handleDemoLogin('Citizen')}>
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg"><UserCircle className="h-4 w-4" /></div>
                  Citizen Portal Access
                </Button>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-6 text-center">
               <p className="text-xs text-muted-foreground w-full">
                Unauthorized access to government systems is strictly monitored.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
