import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import {
  stripe,
  STRIPE_PLANS,
  getOrCreateStripeCustomer,
  createCheckoutSession,
} from "@/lib/stripe";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

const Schema = z.object({
  plan: z.enum(["starter", "team"]),
});

// POST /api/stripe/checkout — crée une session Stripe Checkout
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    // Seul l'owner peut gérer la facturation
    if (session.role !== "owner") {
      return NextResponse.json(
        { error: "Seul le propriétaire peut modifier l'abonnement" },
        { status: 403 }
      );
    }

    const formData = await req.formData().catch(async () => {
      const body = await req.json();
      return { get: (k: string) => body[k] };
    });

    const parsed = Schema.safeParse({ plan: formData.get("plan") });
    if (!parsed.success) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 422 });
    }

    const admin = createAdminClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Récupère les infos de l'org
    const { data: org } = await admin
      .from("organizations")
      .select("id, name, stripe_customer_id")
      .eq("id", session.orgId)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organisation introuvable" }, { status: 404 });
    }

    // Crée ou récupère le customer Stripe
    const customerId = await getOrCreateStripeCustomer(
      org.id,
      user?.email ?? "",
      org.name
    );

    // Met à jour stripe_customer_id si nouveau
    if (!org.stripe_customer_id) {
      await admin
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", session.orgId);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const plan = STRIPE_PLANS[parsed.data.plan];

    const checkoutSession = await createCheckoutSession({
      orgId:      session.orgId,
      customerId,
      priceId:    plan.priceId,
      successUrl: `${appUrl}/settings/billing?success=true`,
      cancelUrl:  `${appUrl}/settings/billing?canceled=true`,
    });

    await logAudit({
      orgId:  session.orgId,
      userId: user?.id,
      action: "billing.plan_upgraded",
      metadata: { plan: parsed.data.plan },
    });

    return NextResponse.redirect(checkoutSession.url!, { status: 303 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur Stripe";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
