"use client"

import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center bg-slate-50 p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Payment Cancelled</CardTitle>
            <CardDescription className="text-center">
              Your subscription payment was cancelled or not completed
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <XCircle className="mb-4 h-16 w-16 text-slate-400" />
            <p className="mb-2 text-lg font-medium">No changes were made to your account</p>
            <p className="text-center text-muted-foreground">
              You can try again whenever you're ready, or continue using the free plan.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={() => router.push("/#pricing")} className="w-full bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
            <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
