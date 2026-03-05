import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { createBillingPortalSession } from "@/lib/stripe";

// POST /api/stripe/portal — redirige vers le portail Stripe
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    if (session.role !== "owner") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const admin = createAdminClient();
    const { data: org } = await admin
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", session.orgId)
      .single();

    if (!org?.stripe_customer_id) {
      return NextResponse.json({ error: "Pas de compte Stripe" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const portalSession = await createBillingPortalSession(
      org.stripe_customer_id,
      `${appUrl}/settings/billing`
    );

    return NextResponse.redirect(portalSession.url, { status: 303 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
