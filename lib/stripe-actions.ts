"use server"

import Stripe from "stripe"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function createCheckoutSession(userId: string) {
  if (!userId) {
    throw new Error("User ID is required")
  }

  try {
    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Mitch Premium Subscription",
              description: "Unlimited scans, priority support, and more",
            },
            unit_amount: 2500, // $25.00 in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/cancel`,
      client_reference_id: userId, // Store the user ID for reference
      metadata: {
        userId: userId,
      },
    })

    // Return the session ID and URL
    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}

export async function handlePaymentSuccess(sessionId: string) {
  try {
    // Retrieve the checkout session to get the customer details
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const userId = session.metadata?.userId || session.client_reference_id

    if (!userId) {
      throw new Error("User ID not found in session")
    }

    // Get the Supabase client
    const supabase = createServerComponentClient({ cookies })

    // Update the user's profile in Supabase
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      account_type: "premium",
      subscription_id: session.subscription as string,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error updating user profile:", error)
      throw new Error("Failed to update user profile")
    }

    // Redirect to the dashboard
    redirect("/dashboard")
  } catch (error) {
    console.error("Error handling payment success:", error)
    throw new Error("Failed to process payment success")
  }
}
