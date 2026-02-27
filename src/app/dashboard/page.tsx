
"use client";

import { useUser } from "@/firebase";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2 } from "lucide-react";
import CitizenDashboard from "./citizen/page";
import OfficialDashboard from "./official/page";
import AuthorityDashboard from "./authority/page";
import { useEffect, useState } from "react";

export default function DashboardRouter() {
  const { user, isUserLoading } = useUser();
  const [role, setRole] = useState<string | null>(null);

  // Advanced role detection for prototype hardening
  useEffect(() => {
    if (user) {
      const email = user.email?.toLowerCase() || "";
      if (email.includes('official') || email.includes('officer') || user.isAnonymous === false && email === "") {
        setRole('Official');
      } else if (email.includes('admin') || email.includes('commissioner') || email.includes('collector')) {
        setRole('Authority');
      } else {
        setRole('Citizen');
      }
    }
  }, [user]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Authenticating with MCIRS Core...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <Navbar />
        <h1 className="text-4xl font-headline font-bold mb-4 text-primary">Identity Required</h1>
        <p className="text-muted-foreground mb-8 max-w-md">Please login with your official credentials or citizen account to access the governance dashboard.</p>
        <a href="/login" className="bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">Login Now</a>
      </div>
    );
  }

  if (role === 'Official') return <OfficialDashboard />;
  if (role === 'Authority') return <AuthorityDashboard />;
  return <CitizenDashboard />;
}
