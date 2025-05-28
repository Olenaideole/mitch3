"use client";
import { useEffect, useState } from "react";
import { Upload } from "@/components/upload";
import { HowItWorks } from "@/components/how-it-works";
import { ReportPreview } from "@/components/report-preview";
import { Testimonials } from "@/components/testimonials";
import { Pricing } from "@/components/pricing";
import { BetaFooter } from "@/components/beta-footer";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth-provider";
import { getScansUsedToday } from "@/lib/scan-limit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
export default function Home() {
    const { userProfile } = useAuth();
    const [scansUsed, setScansUsed] = useState(0);
    const [mounted, setMounted] = useState(false);
    // Check if user has premium account
    const isPremium = userProfile?.account_type === "premium";
    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            setScansUsed(getScansUsedToday());
        }
    }, []);
    return (<div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 text-center md:py-24">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Your Personal Celiac Food Assistant
          </h1>
          <p className="mx-auto mb-12 max-w-3xl text-lg text-muted-foreground md:text-xl">
            Snap a food label photo — we'll instantly detect hidden gluten, risky additives, and cross-contamination
            warnings.
          </p>

          {mounted && !isPremium && scansUsed >= 3 && (<Alert className="mx-auto mb-8 max-w-3xl bg-blue-50">
              <Info className="h-4 w-4 text-blue-600"/>
              <AlertDescription className="text-blue-800">
                You've used all your free scans for today. Upgrade to Premium for unlimited scans.
              </AlertDescription>
            </Alert>)}

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center">
              <Upload />
            </div>
            <div className="flex flex-col items-center justify-center">
              <ReportPreview />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-slate-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">How it works</h2>
            <HowItWorks />
          </div>
        </section>

        <section id="pricing" className="py-16">
          <Pricing />
        </section>

        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Trusted by thousands</h2>
            <Testimonials />
          </div>
        </section>

        <BetaFooter />
      </main>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Mitch — Your Personal Food Assistant for Celiac Disease</p>
        </div>
      </footer>
    </div>);
}
