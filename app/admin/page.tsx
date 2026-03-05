import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; q?: string }>;
}) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "super_admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const admin = createAdminClient();

  // Tous les orgs avec stats
  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name, slug, plan, subscription_status, stripe_customer_id, stripe_subscription_id, created_at, updated_at")
    .order("created_at", { ascending: false });

  // Tous les membres avec profil user
  const { data: members } = await admin
    .from("org_members")
    .select(`
      id, role, accepted_at, created_at,
      org_id,
      user_id,
      users ( id, email, full_name, created_at )
    `)
    .order("created_at", { ascending: false });

  // Audit logs (derniers 200)
  const { data: logs } = await admin
    .from("audit_logs")
    .select("id, user_id, org_id, action, resource_type, resource_id, metadata, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  // Stats MRR
  const paying = orgs?.filter(o => ["starter", "team"].includes(o.plan) && o.subscription_status === "active") ?? [];
  const mrr = paying.reduce((sum, o) => {
    if (o.plan === "starter") return sum + 29;
    if (o.plan === "team")    return sum + 79;
    return sum;
  }, 0);

  return (
    <AdminClient
      orgs={orgs ?? []}
      members={(members ?? []) as any}
      logs={(logs ?? []) as any}
      mrr={mrr}
      flash={{ success: params.success, error: params.error }}
      searchQuery={params.q ?? ""}
    />
  );
}
