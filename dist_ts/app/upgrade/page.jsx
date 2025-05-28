"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
export default function UpgradePage() {
    const router = useRouter();
    const benefits = [
        "Unlimited photo scans",
        "Instant AI-powered analysis",
        "Cross-contamination alerts",
        "Additive & irritant detection",
        "Diet compatibility (FODMAP, Keto, Lactose-free)",
        "Trusted by 5000+ users",
        "Expert-verified reports",
        "24/7 personal assistant in your pocket",
    ];
    const handleUpgrade = () => {
        // In a real app, this would redirect to a payment page
        alert("In a real app, this would redirect to a payment page");
    };
    return (<div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex items-center justify-center py-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">Mitch</span>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 flex items-center">
            <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Main
            </Button>
          </div>

          <div className="mx-auto max-w-2xl">
            <Card className="border-2 border-blue-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">You've reached your free scan limit</CardTitle>
                <CardDescription className="text-base">
                  Mitch keeps you safe — unlimited scans now available for just $25/month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400"/>))}
                    </div>
                  </div>
                  <p className="text-center text-sm">"Lifesaver for my celiac diagnosis!" — Sarah M.</p>

                  <div className="mt-6 space-y-2">
                    {benefits.map((benefit, index) => (<div key={index} className="flex items-start gap-2">
                        <div className="mt-0.5 rounded-full bg-green-100 p-0.5 text-green-600">
                          <Check className="h-4 w-4"/>
                        </div>
                        <span>{benefit}</span>
                      </div>))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpgrade} className="w-full bg-blue-600 py-6 text-lg font-medium hover:bg-blue-700">
                  Get Unlimited Access for $25/month
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Mitch — Your Personal Food Assistant for Celiac Disease</p>
        </div>
      </footer>
    </div>);
}
