"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, User, History, LogOut, Star, Menu, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// Check if we're in a preview environment
const isPreview = typeof window !== "undefined" && window.location.hostname.includes("v0.dev");
export function Header() {
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, userProfile, loading, setUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    // Only run on client side
    useEffect(() => {
        setMounted(true);
    }, []);
    const handleSignOut = async () => {
        if (!mounted)
            return;
        try {
            // In preview mode, just clear the user
            if (isPreview) {
                setUser(null);
                router.push("/");
                return;
            }
            // Dynamically import to prevent any SSR issues
            const { getSupabaseBrowser } = await import("@/lib/supabase-browser");
            const supabase = getSupabaseBrowser();
            if (!supabase) {
                console.error("Could not initialize Supabase client");
                return;
            }
            await supabase.auth.signOut();
            // Update auth context
            setUser(null);
            router.push("/");
        }
        catch (error) {
            console.error("Error signing out:", error);
        }
    };
    // Get user display name (email or username if available)
    const getUserDisplayName = () => {
        if (!user)
            return "";
        return user.user_metadata?.name || user.email || "User";
    };
    // Check if user has premium account
    const isPremium = userProfile?.account_type === "premium";
    // Function to scroll to pricing section or navigate to home page first
    const scrollToPricing = () => {
        if (isHomePage) {
            document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
        }
        else {
            router.push("/#pricing");
        }
        setMobileMenuOpen(false);
    };
    // Function to scroll to how it works section or navigate to home page
    const scrollToHowItWorks = () => {
        if (isHomePage) {
            document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
        }
        else {
            router.push("/#how-it-works");
        }
        setMobileMenuOpen(false);
    };
    // Navigate to blog
    const navigateToBlog = () => {
        router.push("/blog");
        setMobileMenuOpen(false);
    };
    // Don't render auth-related UI until client-side
    const authUI = !mounted ? null : loading ? (<div className="h-9 w-20 animate-pulse rounded-md bg-slate-200"></div>) : user ? (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4"/>
          <span className="max-w-[150px] truncate">{getUserDisplayName()}</span>
          {isPremium && (<Badge variant="outline" className="ml-1 hidden bg-blue-50 px-1.5 text-xs text-blue-700 sm:inline-flex">
              <Star className="mr-1 h-3 w-3 fill-current"/>
              Premium
            </Badge>)}
          <ChevronDown className="h-4 w-4"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
          <History className="mr-2 h-4 w-4"/>
          <span>View Scan History</span>
        </DropdownMenuItem>
        {!isPremium && (<DropdownMenuItem onClick={scrollToPricing} className="cursor-pointer">
            <Star className="mr-2 h-4 w-4"/>
            <span>Upgrade to Premium</span>
          </DropdownMenuItem>)}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4"/>
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>) : (<div className="flex items-center gap-2">
      <Button variant="default" onClick={() => router.push("/signup")}>
        Sign Up
      </Button>
    </div>);
    // Mobile menu content
    const mobileMenuContent = (<div className="flex flex-col space-y-4 p-4">
      <Button variant="ghost" onClick={scrollToHowItWorks} className="justify-start">
        How It Works
      </Button>
      <Button variant="ghost" onClick={scrollToPricing} className="justify-start">
        Pricing
      </Button>
      <Button variant="ghost" onClick={navigateToBlog} className="justify-start">
        <BookOpen className="mr-2 h-4 w-4"/>
        Blog
      </Button>
      {!user && (<>
          <Button variant="default" onClick={() => router.push("/signup")} className="justify-start">
            Sign Up
          </Button>
        </>)}
      {user && (<>
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="justify-start">
            View Scan History
          </Button>
          {!isPremium && (<Button variant="ghost" onClick={scrollToPricing} className="justify-start">
              Upgrade to Premium
            </Button>)}
          <Button variant="ghost" onClick={handleSignOut} className="justify-start text-red-600">
            Sign Out
          </Button>
        </>)}
    </div>);
    return (<header className="container mx-auto flex items-center justify-between py-6">
      <div className="flex flex-col items-start">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-bold text-blue-600">Mitch</span>
        </Link>
        <p className="text-xs text-muted-foreground">powered by Orb Super Ai</p>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden items-center gap-4 md:flex">
        <Button variant="ghost" onClick={scrollToHowItWorks}>
          How It Works
        </Button>
        <Button variant="ghost" onClick={scrollToPricing}>
          Pricing
        </Button>
        <Button variant="ghost" onClick={navigateToBlog}>
          <BookOpen className="mr-2 h-4 w-4"/>
          Blog
        </Button>
        {authUI}
      </div>

      {/* Mobile Navigation */}
      <div className="flex items-center md:hidden">
        {/* Show auth UI on mobile if user is logged in */}
        {user && authUI}

        {/* Mobile menu button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
              <Menu className="h-6 w-6"/>
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="mb-4">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            {mobileMenuContent}
          </SheetContent>
        </Sheet>
      </div>
    </header>);
}
