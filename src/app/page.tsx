import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === "hero-madurai");

  const stats = [
    { label: "MCII Score", value: "84.2", icon: Trophy, color: "text-amber-400", trend: "+2.1%" },
    { label: "Resolved Today", value: "142", icon: CheckCircle, color: "text-green-400", trend: "92%" },
    { label: "Avg. SLA Response", value: "4.2h", icon: Clock, color: "text-blue-400", trend: "-15m" },
    { label: "Active Reports", value: "891", icon: AlertTriangle, color: "text-red-400", trend: "High" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero & Metrics Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImg?.imageUrl || ""} 
            alt="Madurai" 
            fill 
            className="object-cover"
            priority
          />
          {/* Enhanced Dark Overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1428]/80 via-[#0a1428]/60 to-background" />
        </div>

        {/* Subtle Animated Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse pointer-events-none z-10" />

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="mb-6 bg-secondary text-secondary-foreground border-none px-4 py-1 text-xs font-bold uppercase tracking-widest">
              Smart City Mission Madurai
            </Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 leading-tight text-white">
              Digitizing Madurai's <br/><span className="text-secondary">Governance</span>
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              A unified operating system for Madurai's 100 wards. Report issues, track resolutions, and monitor city progress in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 h-14 text-lg rounded-xl shadow-2xl shadow-primary/30" asChild>
                <Link href="/report">Report Civic Issue</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/20 h-14 text-lg rounded-xl" asChild>
                <Link href="/portal">Transparency Portal</Link>
              </Button>
            </div>
          </div>

          {/* Metric Cards - Enhanced Glassmorphism for Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-8">
            {stats.map((stat, i) => (
              <Card key={i} className="border-white/25 bg-white/15 backdrop-blur-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:translate-y-[-4px] transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between relative">
                   {/* Subtle Inner Glow */}
                  <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
                  
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-white/80 mb-1 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-3xl font-headline font-bold text-white mb-2">{stat.value}</h3>
                    <Badge variant="outline" className="text-[10px] bg-white/10 text-white border-white/20 group-hover:bg-primary/40 transition-colors">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className={`p-3 rounded-2xl bg-white/10 ${stat.color} shadow-inner`}>
                    <stat.icon className="h-7 w-7 filter drop-shadow-[0_0_8px_currentColor]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 p-6 rounded-2xl hover:bg-white transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-semibold">Accountability First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every issue is tracked via immutable audit logs. Automated escalation ensures that no complaint goes unnoticed by senior officials.
              </p>
            </div>
            <div className="space-y-4 p-6 rounded-2xl hover:bg-white transition-colors">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-semibold">Ward Intelligence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Hyper-local governance across all 100 wards. GPS-based mapping connects citizens directly to their respective Ward Officers.
              </p>
            </div>
            <div className="space-y-4 p-6 rounded-2xl hover:bg-white transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-semibold">Civic Rewards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Wards compete for the highest MCII rankings. Top performing wards receive priority budget allocation for infrastructure projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard CTA */}
      <section className="bg-primary/5 py-20 border-y border-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-headline font-bold mb-6">Explore the Ward Leaderboard</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Transparency is our core mission. View how your ward compares to the rest of Madurai in responsiveness and evidence-based completion.
          </p>
          <Button size="lg" className="rounded-xl h-14 px-8 text-lg" variant="default" asChild>
            <Link href="/portal" className="flex items-center gap-2">
              View Ward Scores <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="mt-auto bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="text-secondary h-8 w-8" />
              <h2 className="text-2xl font-headline font-bold">MCIRS</h2>
            </div>
            <p className="text-white/60 max-w-sm leading-relaxed text-sm">
              The official Civic Intelligence and Response System of Madurai Corporation. Empowering citizens through technology and transparent, evidence-driven governance.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-[10px] text-white/40">Quick Links</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li><Link href="/report" className="hover:text-secondary transition-colors">Report an Issue</Link></li>
              <li><Link href="/portal" className="hover:text-secondary transition-colors">Transparency Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-secondary transition-colors">Officer Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-[10px] text-white/40">Contact Support</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <span className="text-white/40 font-bold">Toll Free:</span> 1800-425-XXXX
              </li>
              <li>support@maduraicorp.gov.in</li>
              <li>Madurai Corporation Office, TN</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-12 mt-12 border-t border-white/10 text-center text-[10px] text-white/30 uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Madurai Corporation. Built for Smart City Mission.
        </div>
      </footer>
    </div>
  );
}
