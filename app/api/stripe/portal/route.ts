import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function must(n: string, v?: string) {
  if (!v) throw new Error(`Missing env var: ${n}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const stripe = new Stripe(
      must("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY)
    );

    // Find the customer's Stripe ID via metadata search
    const customers = await stripe.customers.search({
      query: `metadata['clerkUserId']:'${userId}'`,
      limit: 1,
    });
    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "no_stripe_customer" },
        { status: 404 }
      );
    }

    const origin = new URL(req.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${origin}/app`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "portal error" },
      { status: 500 }
    );
  }
}
