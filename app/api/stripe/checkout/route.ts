// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function must(name: string, v?: string) {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const STRIPE_SECRET_KEY = must(
      "STRIPE_SECRET_KEY",
      process.env.STRIPE_SECRET_KEY
    );
    const PRICE_ID = must(
      "STRIPE_PRICE_INSTRUCTOR",
      process.env.STRIPE_PRICE_INSTRUCTOR
    );

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    // Create a customer tagged with clerkUserId for the webhook to map back
    const customer = await stripe.customers.create({
      // email is optional; we can omit to avoid Clerk client on server
      metadata: { clerkUserId: userId },
    });

    const origin = new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${origin}/app?upgraded=1`,
      cancel_url: `${origin}/pricing?cancelled=1`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    const message =
      err?.message || err?.raw?.message || "Unknown checkout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
