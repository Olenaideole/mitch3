"use client"

import { useState, useEffect } from "react"
import { Check, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { createCheckoutSession } from "@/lib/stripe-actions"
import { useToast } from "@/hooks/use-toast"

export function Pricing() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const isPremium = userProfile?.account_type === "premium"

  // Countdown timer logic
  const initialTime = 48 * 60 * 60 // 48 hours in seconds
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    if (timeLeft === 0) {
      setTimeLeft(initialTime)
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, initialTime])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleGetPremium = async () => {
    if (!user) {
      // If user is not logged in, redirect to signup
      router.push("/signup")
      return
    }

    if (isPremium) {
      // If user is already premium, redirect to dashboard
      router.push("/dashboard")
      return
    }

    try {
      setIsLoading(true)

      // Create a checkout session
      const { url } = await createCheckoutSession(user.id)

      // Redirect to the checkout page
      if (url) {
        window.location.href = url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: "Failed to start the checkout process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">Simple, Transparent Pricing</h2>
        <p className="text-lg text-muted-foreground">
          Choose the plan that's right for you and start scanning with confidence.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {/* Free Plan */}
        <Card className={`relative flex flex-col border-2 ${!isPremium ? "border-blue-200" : ""}`}>
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Get started with basic protection</CardDescription>
            <div className="mt-4 text-3xl font-bold">$0</div>
            <p className="text-sm text-muted-foreground">Forever free</p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="mb-6 space-y-3">
              <li className="flex items-start">
                <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>3 free scans per day</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Basic scan history access</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Community support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <div className="w-full rounded-md bg-slate-100 py-2 text-center font-medium">
              {!isPremium ? "Current Plan" : "Basic Plan"}
            </div>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={`relative flex flex-col border-2 ${isPremium ? "border-blue-200 shadow-lg" : "shadow-lg"}`}>
          <div className="absolute -top-4 right-4">
            <Badge className="bg-blue-600 px-3 py-1 text-white">
              <Star className="mr-1 h-3.5 w-3.5 fill-current" />
              Best Value
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Premium</CardTitle>
            <CardDescription>Complete protection for your health</CardDescription>
            <div className="mt-4 flex items-end gap-2">
              <div className="text-3xl font-bold">$4.5</div>
              <div className="text-xl font-medium text-muted-foreground line-through">$12</div>
              <div className="text-sm">/month</div>
            </div>
            <p className="text-sm text-muted-foreground">Billed monthly</p>
            {/* Countdown Timer Display */}
            <div className="mt-3 text-center text-lg font-medium text-red-600">
              Offer ends in: {formatTime(timeLeft)}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="mb-6 space-y-3">
              <li className="flex items-start">
                <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="font-medium">Unlimited scans</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Priority customer support</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Full scan history access</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Early access to new features</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPremium ? (
              <div className="w-full rounded-md bg-green-100 py-2 text-center font-medium text-green-800">
                Current Plan
              </div>
            ) : (
              <Button
                onClick={handleGetPremium}
                disabled={isLoading}
                className="w-full bg-blue-600 py-6 text-lg font-medium hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Get Premium"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
