
"use client";

import Link from "next/link";
import { Building2, UserCircle, Bell, LogOut, ChevronDown, PlusCircle, PieChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navLinks = [
    { name: "Public Portal", href: "/portal", icon: PieChart },
    { name: "Report Issue", href: "/report", icon: PlusCircle },
    { name: "Governance", href: "/dashboard", icon: ShieldCheck },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-white/95 backdrop-blur-md shadow-lg py-3" : "bg-transparent py-6"
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-primary p-2.5 rounded-xl group-hover:rotate-12 transition-all shadow-lg shadow-primary/20">
            <Building2 className="text-white h-6 w-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className={cn(
              "font-headline font-black text-2xl leading-none tracking-tight",
              scrolled ? "text-primary" : "text-white drop-shadow-md"
            )}>MCIRS</h1>
            <p className={cn(
              "text-[9px] uppercase tracking-[0.2em] font-bold opacity-80",
              scrolled ? "text-muted-foreground" : "text-white/80"
            )}>Madurai Corporation</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Button 
              key={link.href} 
              variant="ghost" 
              asChild 
              className={cn(
                "rounded-xl h-10 px-4 gap-2 transition-all",
                pathname === link.href ? "bg-primary/10 text-primary font-bold" : (scrolled ? "text-muted-foreground hover:bg-muted" : "text-white/90 hover:bg-white/10")
              )}
            >
              <Link href={link.href}>
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className={cn(
            "rounded-xl transition-colors",
            scrolled ? "text-muted-foreground hover:bg-muted" : "text-white/90 hover:bg-white/10"
          )}>
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={scrolled ? "outline" : "ghost"} 
                className={cn(
                  "gap-3 pl-2 pr-4 h-12 rounded-2xl transition-all border-white/20",
                  scrolled ? "bg-white shadow-sm" : "text-white hover:bg-white/10"
                )}
              >
                <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center">
                  <UserCircle className={cn("h-6 w-6", scrolled ? "text-primary" : "text-white")} />
                </div>
                <div className="hidden lg:block text-left leading-none">
                  <p className="text-xs font-bold uppercase tracking-tighter truncate max-w-[80px]">
                    {user?.isAnonymous ? "Citizen" : user?.email?.split('@')[0] || "Guest"}
                  </p>
                  <p className="text-[9px] opacity-60">Identity Verified</p>
                </div>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-none mt-2">
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">User Profile</p>
                <p className="text-sm font-semibold truncate mt-1">{user?.email || "Authenticated Citizen"}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild className="rounded-xl h-11 px-3 cursor-pointer">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  My Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl h-11 px-3 cursor-pointer">
                <Link href="/report" className="flex items-center gap-3">
                  <PlusCircle className="h-4 w-4 text-primary" />
                  Submit Grievance
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              {user && !user.isAnonymous ? (
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/5 rounded-xl h-11 px-3 gap-3 cursor-pointer">
                  <LogOut className="h-4 w-4" /> Sign Out from MCIRS
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild className="rounded-xl h-11 px-3 cursor-pointer">
                  <Link href="/login" className="flex items-center gap-3">
                    <LogIn className="h-4 w-4 text-primary" />
                    Officer Login
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

// Helper to prevent TS errors on LogIn icon
function LogIn(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}
