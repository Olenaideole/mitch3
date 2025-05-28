import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16",
});
// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
export async function POST(req) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    let event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    }
    catch (err) {
        const error = err;
        console.error(`Webhook Error: ${error.message}`);
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }
    // Get the Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const checkoutSession = event.data.object;
            const userId = checkoutSession.metadata?.userId || checkoutSession.client_reference_id;
            if (userId) {
                // Update the user's profile in Supabase
                const { error } = await supabase.from("profiles").upsert({
                    id: userId,
                    account_type: "premium",
                    subscription_id: checkoutSession.subscription,
                    updated_at: new Date().toISOString(),
                });
                if (error) {
                    console.error("Error updating user profile:", error);
                }
            }
            break;
        case "customer.subscription.updated":
            const subscription = event.data.object;
            // Handle subscription updates (e.g., plan changes, payment method updates)
            break;
        case "customer.subscription.deleted":
            const deletedSubscription = event.data.object;
            // Handle subscription cancellations
            // Find the user with this subscription ID
            const { data: profiles, error: fetchError } = await supabase
                .from("profiles")
                .select("id")
                .eq("subscription_id", deletedSubscription.id);
            if (fetchError) {
                console.error("Error fetching profiles:", fetchError);
            }
            else if (profiles && profiles.length > 0) {
                // Update the user's profile to free
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({
                    account_type: "free",
                    subscription_id: null,
                    updated_at: new Date().toISOString(),
                })
                    .eq("subscription_id", deletedSubscription.id);
                if (updateError) {
                    console.error("Error updating user profile:", updateError);
                }
            }
            break;
        case "invoice.payment_failed":
            // Handle failed payments
            // You might want to notify the user or take other actions
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    return NextResponse.json({ received: true });
}
