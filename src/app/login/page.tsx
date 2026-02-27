"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { USER_ROLES } from "@/lib/constants";
import { Building2, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="border-none shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <ShieldCheck className="h-10 w-10" />
                </div>
              </div>
              <CardTitle className="text-2xl font-headline font-bold">Officer Login</CardTitle>
              <CardDescription>Secure access for Madurai Corporation officials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">Official ID / Phone</Label>
                <Input id="id" placeholder="MDU-XXXXX" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" className="rounded-xl" />
              </div>
              <Button className="w-full h-12 rounded-xl text-lg font-semibold" asChild>
                <Link href="/dashboard/official">Login to Dashboard</Link>
              </Button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Demo Role Access</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {USER_ROLES.filter(r => r !== 'Citizen').map(role => (
                  <Button key={role} variant="outline" size="sm" className="text-[10px] h-8 justify-start px-2">
                    {role}
                  </Button>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground pt-4">
                Citizen? <Link href="/dashboard/citizen" className="text-primary font-semibold hover:underline">Access Citizen Portal</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}