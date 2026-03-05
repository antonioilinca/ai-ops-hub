import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, users(email, full_name)")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Logs d'audit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historique de toutes les actions sur votre espace
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Utilisateur</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ressource</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!logs || logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Aucun log pour l'instant
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const u = log.users as { email: string; full_name: string | null } | null;
                  return (
                    <tr key={log.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u?.full_name ?? u?.email ?? "Système"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {log.resource_type ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
