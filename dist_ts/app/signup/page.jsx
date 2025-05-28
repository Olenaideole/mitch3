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
// Check if we're in a preview environment
const isPreview = typeof window !== "undefined" && window.location.hostname.includes("v0.dev");
export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    useEffect(() => {
        setMounted(true);
    }, []);
    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!mounted)
            return;
        setLoading(true);
        setError(null);
        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        // Validate password strength
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            setLoading(false);
            return;
        }
        try {
            // In preview mode, just simulate success
            if (isPreview) {
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setSuccess(true);
                setLoading(false);
                return;
            }
            // Dynamically import to prevent any SSR issues
            const { getSupabaseBrowser } = await import("@/lib/supabase-browser");
            const supabase = getSupabaseBrowser();
            if (!supabase) {
                throw new Error("Could not initialize Supabase client");
            }
            // Get the current domain for the redirect URL
            const redirectTo = process.env.NEXT_PUBLIC_BASE_URL + "/auth/callback";
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectTo,
                },
            });
            if (error) {
                setError(error.message);
                return;
            }
            setSuccess(true);
        }
        catch (err) {
            console.error("Sign up error:", err);
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
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="mt-2 text-muted-foreground">Sign up to save your scan history and access more features.</p>
          </div>

          {error && (<Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>)}

          {success ? (<Alert className="mb-6 bg-green-50">
              <AlertDescription>
                Success! Please check your email for a confirmation link to complete your registration.
              </AlertDescription>
            </Alert>) : (<form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !mounted}>
                {loading ? (<>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    Creating account...
                  </>) : ("Sign Up")}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/signin" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>)}
        </div>
      </main>
    </div>);
}
