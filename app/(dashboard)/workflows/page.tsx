import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeleteWorkflowButton from "./DeleteWorkflowButton";
import { WORKFLOW_TEMPLATES } from "@/data/templates";

/** Lookup table pour afficher les infos d'un workflow existant */
const TEMPLATE_MAP = Object.fromEntries(
  WORKFLOW_TEMPLATES.map((t) => [t.id, { label: t.name, icon: t.icon, desc: t.desc }])
);

export default async function WorkflowsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const isOwnerOrAdmin = ["owner", "admin"].includes(member.role);

  const { data: workflows } = await supabase
    .from("workflows")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos automatisations IA
          </p>
        </div>
        <a
          href="/workflows/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Nouveau workflow
        </a>
      </div>

      {/* Empty state — renvoie vers les templates */}
      {(!workflows || workflows.length === 0) && (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-lg font-semibold mb-2">Aucun workflow pour l&apos;instant</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Explorez nos {WORKFLOW_TEMPLATES.length} templates prêts à l&apos;emploi pour automatiser votre business en quelques minutes.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/templates"
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Explorer les templates →
            </a>
            <a
              href="/workflows/new"
              className="bg-muted text-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              Créer manuellement
            </a>
          </div>
        </div>
      )}

      {/* Liste des workflows existants */}
      {workflows && workflows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => {
            const info = TEMPLATE_MAP[wf.type];
            return (
              <div
                key={wf.id}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{info?.icon ?? "⚙️"}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        wf.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {wf.is_active ? "Actif" : "Inactif"}
                    </span>
                    {isOwnerOrAdmin && (
                      <DeleteWorkflowButton
                        workflowId={wf.id}
                        workflowName={wf.name}
                        onlyIcon={true}
                      />
                    )}
                  </div>
                </div>
                <div className="font-medium text-sm">{wf.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {info?.label ?? wf.type}
                </div>
                <div className="flex gap-2 mt-4">
                  <a
                    href={`/workflows/${wf.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Configurer →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
