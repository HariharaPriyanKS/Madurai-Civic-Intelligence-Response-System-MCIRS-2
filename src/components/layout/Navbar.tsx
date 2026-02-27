"use client";

import Link from "next/link";
import { Building2, UserCircle, Menu, Bell, LogOut, ChevronDown } from "lucide-react";
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
import { useRouter } from "next/navigation";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-200 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg group-hover:scale-110 transition-transform">
            <Building2 className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-xl leading-none text-primary">MCIRS</h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Madurai Governance</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link href="/portal" className="hover:text-primary transition-colors">Public Portal</Link>
          <Link href="/report" className="hover:text-primary transition-colors">Report Issue</Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 hover:bg-muted/50 rounded-xl">
                <UserCircle className="h-6 w-6" />
                <span className="hidden sm:inline text-xs font-bold text-muted-foreground truncate max-w-[100px]">
                  {user?.isAnonymous ? "Citizen" : user?.email?.split('@')[0] || "Guest"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-2xl border-none">
              <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase">Identity Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-lg">
                <Link href="/dashboard">My Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg">
                <Link href="/report">Submit Grivence</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user && !user.isAnonymous ? (
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive rounded-lg gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/login">Officer Login</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
