"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";
// Check if we're in a preview environment
const isPreview = typeof window !== "undefined" && window.location.hostname.includes("v0.dev");
export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const { setUser } = useAuth();
    useEffect(() => {
        setMounted(true);
    }, []);
    const handleSignIn = async (e) => {
        e.preventDefault();
        if (!mounted)
            return;
        setLoading(true);
        setError(null);
        try {
            // In preview mode, just simulate success
            if (isPreview) {
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 1000));
                // Create a mock user
                const mockUser = {
                    id: "mock-user-id",
                    email,
                    app_metadata: {},
                    user_metadata: {},
                    aud: "authenticated",
                    created_at: new Date().toISOString(),
                };
                // Update auth context
                setUser(mockUser);
                router.push("/dashboard");
                return;
            }
            // Dynamically import to prevent any SSR issues
            const { getSupabaseBrowser } = await import("@/lib/supabase-browser");
            const supabase = getSupabaseBrowser();
            if (!supabase) {
                throw new Error("Could not initialize Supabase client");
            }
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message);
                return;
            }
            // Update auth context
            setUser(data.user);
            router.push("/dashboard");
        }
        catch (err) {
            console.error("Sign in error:", err);
            setError("An unexpected error occurred. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto max-w-md px-4 py-12">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="mt-2 text-muted-foreground">Welcome back! Sign in to access your account.</p>
          </div>

          {error && (<Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>)}

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !mounted}>
              {loading ? (<>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Signing in...
                </>) : ("Sign In")}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>);
}
