import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Récupère l'org et le rôle de l'utilisateur
  const { data: member } = await supabase
    .from("org_members")
    .select("role, organizations(id, name, plan, subscription_status)")
    .eq("user_id", user.id)
    .not("accepted_at", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  const org = (member?.organizations as unknown) as {
    id: string;
    name: string;
    plan: string;
    subscription_status: string;
  } | null;

  // Nouvel utilisateur sans org → onboarding
  if (!member || !org) {
    redirect("/onboarding");
  }

  const isSuperAdmin = user.app_metadata?.role === "super_admin";

  return (
    <div className="flex h-screen bg-background">
      <Sidebar orgName={org.name} plan={org.plan} role={member.role} isSuperAdmin={isSuperAdmin} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={{ email: user.email ?? "", id: user.id }} orgName={org.name} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
