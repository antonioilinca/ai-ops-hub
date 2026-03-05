import Stripe from "stripe";

// Singleton Stripe — réutilisé entre les appels
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

// Plans disponibles mappés aux price IDs Stripe
export const STRIPE_PLANS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    name: "Starter",
    amount: 4900, // centimes
  },
  team: {
    priceId: process.env.STRIPE_PRICE_TEAM!,
    name: "Team",
    amount: 14900,
  },
} as const;

// Créer ou récupérer un customer Stripe pour une org
export async function getOrCreateStripeCustomer(
  orgId: string,
  email: string,
  orgName: string
): Promise<string> {
  // Cherche un customer existant par metadata
  const existing = await stripe.customers.search({
    query: `metadata['org_id']:'${orgId}'`,
    limit: 1,
  });

  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    name: orgName,
    metadata: { org_id: orgId },
  });

  return customer.id;
}

// Créer une session de checkout
export async function createCheckoutSession({
  orgId,
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  orgId: string;
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { org_id: orgId },
    subscription_data: { metadata: { org_id: orgId } },
    billing_address_collection: "required",
    allow_promotion_codes: true,
  });
}

// Créer un portail client Stripe (gestion abonnement)
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
