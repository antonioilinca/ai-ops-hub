import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PLANS } from "@/types";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role, organizations(name, plan, subscription_status, stripe_customer_id)")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const org = (member.organizations as unknown) as {
    name: string;
    plan: keyof typeof PLANS;
    subscription_status: string;
    stripe_customer_id: string | null;
  } | null;

  if (!org) redirect("/onboarding");

  const currentPlan = PLANS[org.plan];
  const isOwner = member.role === "owner";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Facturation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez votre abonnement OpsAI
        </p>
      </div>

      {/* Plan actuel */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-lg">{currentPlan.name}</div>
            <div className="text-sm text-muted-foreground">
              {org.subscription_status === "active"
                ? "Abonnement actif"
                : org.subscription_status === "trialing"
                ? "Période d'essai"
                : "Inactif"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {currentPlan.price === 0 ? "Gratuit" : `${currentPlan.price}€/mois`}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center border-t border-border pt-4">
          <div>
            <div className="font-semibold">{currentPlan.maxWorkflows}</div>
            <div className="text-xs text-muted-foreground">Workflows</div>
          </div>
          <div>
            <div className="font-semibold">{currentPlan.maxMembers}</div>
            <div className="text-xs text-muted-foreground">Membres</div>
          </div>
          <div>
            <div className="font-semibold">EU</div>
            <div className="text-xs text-muted-foreground">Hébergement</div>
          </div>
        </div>
      </div>

      {/* Upgrade */}
      {isOwner && org.plan !== "team" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {org.plan === "free" && (
            <PlanCard plan="starter" isOwner={isOwner} />
          )}
          <PlanCard plan="team" isOwner={isOwner} />
        </div>
      )}

      {/* Gérer l'abonnement (portal Stripe) */}
      {isOwner && org.stripe_customer_id && (
        <form action="/api/stripe/portal" method="POST">
          <button
            type="submit"
            className="text-sm text-primary hover:underline"
          >
            Gérer l'abonnement (factures, carte bancaire) →
          </button>
        </form>
      )}

      {!isOwner && (
        <p className="text-sm text-muted-foreground">
          Seul le propriétaire du compte peut modifier l'abonnement.
        </p>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  isOwner,
}: {
  plan: "starter" | "team";
  isOwner: boolean;
}) {
  const p = PLANS[plan];
  return (
    <div className="bg-card border border-primary/30 rounded-xl p-5">
      <div className="font-semibold mb-1">{p.name}</div>
      <div className="text-2xl font-bold mb-3">{p.price}€<span className="text-sm font-normal text-muted-foreground">/mois</span></div>
      <ul className="text-sm text-muted-foreground space-y-1 mb-4">
        <li>✓ {p.maxWorkflows} workflows</li>
        <li>✓ {p.maxMembers} membres</li>
        <li>✓ Support prioritaire</li>
      </ul>
      {isOwner && (
        <form action="/api/stripe/checkout" method="POST">
          <input type="hidden" name="plan" value={plan} />
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Passer au plan {p.name}
          </button>
        </form>
      )}
    </div>
  );
}
