"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { handlePaymentSuccess } from "@/lib/stripe-actions"
import { Header } from "@/components/header"

export default function PaymentSuccessPage() {
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    async function processPayment() {
      if (!sessionId) {
        setError("Invalid session ID")
        setIsProcessing(false)
        return
      }

      try {
        await handlePaymentSuccess(sessionId)
        // The handlePaymentSuccess function will redirect to the dashboard if successful
      } catch (err) {
        console.error("Error processing payment:", err)
        setError("Failed to process your payment. Please contact support.")
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [sessionId])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center bg-slate-50 p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Payment {error ? "Error" : "Successful"}</CardTitle>
            <CardDescription className="text-center">
              {error ? "There was an issue with your payment" : "Thank you for subscribing to Mitch Premium!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
                <p>Processing your payment...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="mb-4 text-red-600">{error}</p>
                <p>Please try again or contact our support team for assistance.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <CheckCircle className="mb-4 h-16 w-16 text-green-600" />
                <p className="mb-2 text-lg font-medium">Your payment was successful!</p>
                <p className="text-center text-muted-foreground">
                  Your account has been upgraded to Premium. You now have access to unlimited scans and all premium
                  features.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
              variant={error ? "outline" : "default"}
            >
              {error ? "Return to Dashboard" : "Go to Your Dashboard"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
