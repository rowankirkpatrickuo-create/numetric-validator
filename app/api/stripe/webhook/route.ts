import { NextResponse } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

// Ensure this route runs on Node.js (not Edge)
export const runtime = "nodejs";
// Avoid caching
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  // 1) Verify Stripe signature
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  const rawBody = await req.text();

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `invalid signature: ${err?.message ?? "unknown"}` },
      { status: 400 }
    );
  }

  // 2) Handle subscription lifecycle → update Clerk metadata
  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        // We set this in /api/stripe/checkout when creating the customer
        const clerkUserId =
          (customer as Stripe.Customer).metadata?.clerkUserId || undefined;

        if (clerkUserId) {
          await clerkClient.users.updateUser(clerkUserId, {
            publicMetadata: { role: "instructor", plan: "instructor" },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        const clerkUserId =
          (customer as Stripe.Customer).metadata?.clerkUserId || undefined;

        if (clerkUserId) {
          await clerkClient.users.updateUser(clerkUserId, {
            publicMetadata: { role: "student", plan: "free" },
          });
        }
        break;
      }

      default:
        // ignore other events for now
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    // Log and return 500 so Stripe can retry if something transient happened
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: err?.message ?? "server error" },
      { status: 500 }
    );
  }
}
