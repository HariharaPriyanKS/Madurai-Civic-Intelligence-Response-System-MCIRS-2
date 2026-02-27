import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === "hero-madurai");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImg?.imageUrl || ""} 
            alt="Madurai" 
            fill 
            className="object-cover brightness-[0.4]"
            priority
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-white">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-secondary text-secondary-foreground border-none">Smart City Mission Madurai</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 leading-tight">
              Digitizing Madurai's <br/><span className="text-secondary">Governance</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-lg">
              A unified operating system for Madurai's 100 wards. Report issues, track resolutions, and monitor city progress in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-14 text-lg rounded-xl shadow-xl shadow-primary/20" asChild>
                <Link href="/report">Report Civic Issue</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 h-14 text-lg rounded-xl" asChild>
                <Link href="/portal">Transparency Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / MCII Summary */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-32 relative z-20">
          {[
            { label: "MCII Score", value: "84.2", icon: Trophy, color: "text-amber-500", trend: "+2.1%" },
            { label: "Resolved Today", value: "142", icon: CheckCircle, color: "text-green-500", trend: "92%" },
            { label: "Avg. SLA Response", value: "4.2h", icon: Clock, color: "text-blue-500", trend: "-15m" },
            { label: "Active Reports", value: "891", icon: AlertTriangle, color: "text-red-500", trend: "High" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-2xl hover:translate-y-[-4px] transition-transform">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-3xl font-headline font-bold text-foreground">{stat.value}</h3>
                  <Badge variant="outline" className="mt-2 text-[10px] bg-muted border-none">{stat.trend}</Badge>
                </div>
                <div className={`p-4 rounded-2xl bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-headline font-semibold">Accountability First</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every issue is tracked via immutable audit logs. Automated escalation ensures that no complaint goes unnoticed by senior officials.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-headline font-semibold">Ward Intelligence</h3>
            <p className="text-muted-foreground leading-relaxed">
              Hyper-local governance across all 100 wards. GPS-based mapping connects citizens directly to their respective Ward Officers.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-headline font-semibold">Civic Rewards</h3>
            <p className="text-muted-foreground leading-relaxed">
              Wards compete for the highest MCII rankings. Top performing wards receive priority budget allocation for infrastructure projects.
            </p>
          </div>
        </div>
      </section>

      {/* Leaderboard CTA */}
      <section className="bg-primary/5 py-24 border-y border-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-headline font-bold mb-6">Explore the Ward Leaderboard</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Transparency is our core mission. View how your ward compares to the rest of Madurai in cleanliness and responsiveness.
          </p>
          <Button size="lg" className="rounded-xl h-14 px-8 text-lg" variant="default" asChild>
            <Link href="/portal" className="flex items-center gap-2">
              View Ward Scores <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="mt-auto bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="text-secondary h-8 w-8" />
              <h2 className="text-2xl font-headline font-bold">MCIRS</h2>
            </div>
            <p className="text-white/60 max-w-sm leading-relaxed">
              The official Civic Intelligence and Response System of Madurai Corporation. Empowering citizens through technology and transparent governance.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/40">Quick Links</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li><Link href="/report">Report an Issue</Link></li>
              <li><Link href="/portal">Transparency Dashboard</Link></li>
              <li><Link href="/login">Officer Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/40">Contact</h4>
            <ul className="space-y-4 text-sm text-white/80">
              <li>1800-425-XXXX (Toll Free)</li>
              <li>support@maduraicorp.gov.in</li>
              <li>Madurai Corporation Office</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-12 mt-12 border-t border-white/10 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Madurai Corporation. All rights reserved. Built for Smart City Mission.
        </div>
      </footer>
    </div>
  );
}
