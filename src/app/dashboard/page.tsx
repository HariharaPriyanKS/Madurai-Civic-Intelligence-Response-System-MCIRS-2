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

  // Mock role detection for prototype
  useEffect(() => {
    if (user) {
      // In a real app, we'd check firestore for the role.
      // Here we use a simple mock based on the email or just default.
      if (user.email?.includes('official')) setRole('Official');
      else if (user.email?.includes('admin') || user.email?.includes('commissioner')) setRole('Authority');
      else setRole('Citizen');
    }
  }, [user]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <Navbar />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">Please login to view your personalized dashboard.</p>
        <a href="/login" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Login Now</a>
      </div>
    );
  }

  if (role === 'Official') return <OfficialDashboard />;
  if (role === 'Authority') return <AuthorityDashboard />;
  return <CitizenDashboard />;
}
