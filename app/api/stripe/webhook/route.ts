import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// IMPORTANT: désactive le body parser Next.js pour lire le raw body
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// Mapping statut Stripe → statut OpsAI
function mapSubscriptionStatus(status: Stripe.Subscription.Status) {
  const map: Record<string, string> = {
    active:    "active",
    trialing:  "trialing",
    past_due:  "past_due",
    canceled:  "canceled",
    unpaid:    "past_due",
    incomplete: "inactive",
    incomplete_expired: "inactive",
    paused:    "inactive",
  };
  return map[status] ?? "inactive";
}

// Mapping price_id → plan OpsAI
function getPlanFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) return "starter";
  if (priceId === process.env.STRIPE_PRICE_TEAM_MONTHLY) return "team";
  return "free";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe-webhook] Signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      // Abonnement créé ou mis à jour
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.org_id;
        if (!orgId) break;

        const priceId = sub.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId ?? "");

        await admin.from("organizations").update({
          stripe_subscription_id: sub.id,
          subscription_status:    mapSubscriptionStatus(sub.status),
          plan,
          updated_at: new Date().toISOString(),
        }).eq("id", orgId);

        console.log(`[stripe] Abonnement mis à jour: org=${orgId} plan=${plan} status=${sub.status}`);
        break;
      }

      // Abonnement annulé
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.org_id;
        if (!orgId) break;

        await admin.from("organizations").update({
          subscription_status:    "canceled",
          plan:                   "free",
          stripe_subscription_id: null,
          updated_at:             new Date().toISOString(),
        }).eq("id", orgId);

        console.log(`[stripe] Abonnement annulé: org=${orgId}`);
        break;
      }

      // Paiement réussi (log uniquement)
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe] Paiement reçu: ${invoice.amount_paid / 100}€ - ${invoice.customer_email}`);
        break;
      }

      // Paiement échoué — alerter l'org
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: org } = await admin
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          await admin.from("organizations").update({
            subscription_status: "past_due",
          }).eq("id", org.id);
        }

        console.warn(`[stripe] Paiement échoué: ${invoice.customer_email}`);
        break;
      }

      default:
        // Ignore les autres événements
        break;
    }
  } catch (err) {
    console.error(`[stripe-webhook] Erreur traitement event ${event.type}:`, err);

    // Log l'erreur dans audit_logs pour visibilité (silencieux sinon)
    try {
      await admin.from("audit_logs").insert({
        org_id: "00000000-0000-0000-0000-000000000000",
        action: "billing.webhook_error",
        resource_type: "stripe_event",
        resource_id: event.id,
        metadata: { event_type: event.type, error: err instanceof Error ? err.message : String(err) },
      });
    } catch { /* best-effort */ }

    // On renvoie 200 quand même pour éviter les retries Stripe sur nos bugs
    return NextResponse.json({ received: true, error: "Erreur interne" });
  }

  return NextResponse.json({ received: true });
}
