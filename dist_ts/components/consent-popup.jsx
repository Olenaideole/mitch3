"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Shield, FileText } from "lucide-react";
const CONSENT_KEY = "mitch-user-consent";
export function ConsentPopup() {
    const [showConsent, setShowConsent] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        // Check if user has already given consent
        const hasConsented = localStorage.getItem(CONSENT_KEY);
        if (!hasConsented) {
            setShowConsent(true);
        }
    }, []);
    const handleAgree = () => {
        localStorage.setItem(CONSENT_KEY, "true");
        setShowConsent(false);
    };
    if (!mounted || !showConsent) {
        return null;
    }
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600"/>
          </div>
          <CardTitle className="text-xl">Privacy & Terms</CardTitle>
          <CardDescription>
            We value your privacy and want to be transparent about how we handle your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            By using Mitch, you agree to our privacy policy and terms of service. We respect your privacy and will never
            share your personal data without your permission.
          </p>

          <div className="flex flex-col gap-2">
            <Button onClick={handleAgree} className="w-full bg-blue-600 hover:bg-blue-700">
              I Agree
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4"/>
                  View Terms
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Privacy Policy & Terms of Service</DialogTitle>
                  <DialogDescription>Please review our privacy policy and terms of service below.</DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto rounded-md bg-slate-50 p-4 text-sm">
                  <p className="leading-relaxed">
                    We respect your privacy. Any personal data you provide will be treated as strictly confidential and
                    used only to deliver and improve our services. We will never sell, share, or disclose your personal
                    data to third parties without your explicit permission. By continuing to use this site, you agree to
                    our terms of service and privacy policy. You may contact us anytime to review or delete your
                    personal data.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAgree} className="bg-blue-600 hover:bg-blue-700">
                    I Agree
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>);
}
