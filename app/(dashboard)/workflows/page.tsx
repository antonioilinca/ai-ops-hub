import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const { data: workflows } = await supabase
    .from("workflows")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  const WORKFLOW_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
    email_triage:       { label: "Triage email",          icon: "📧", desc: "Classe et répond aux emails entrants" },
    meeting_summary:    { label: "Compte-rendu réunion",  icon: "🎙", desc: "Génère CR et tâches depuis un audio" },
    weekly_report:      { label: "Rapport hebdo",         icon: "📊", desc: "Synthèse auto chaque lundi" },
    proposal_generator: { label: "Générateur de propale", icon: "📄", desc: "Propale pro en 5 min" },
    qa_bot:             { label: "Base de connaissance",  icon: "💬", desc: "Q&A sur vos documents" },
  };

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

      {/* Templates disponibles si aucun workflow */}
      {(!workflows || workflows.length === 0) && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Commencez par choisir un template :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(WORKFLOW_LABELS).map(([type, info]) => (
              <a
                key={type}
                href={`/workflows/new?type=${type}`}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="text-3xl mb-3">{info.icon}</div>
                <div className="font-medium text-sm">{info.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{info.desc}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Liste des workflows existants */}
      {workflows && workflows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => {
            const info = WORKFLOW_LABELS[wf.type];
            return (
              <div
                key={wf.id}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{info?.icon ?? "⚙️"}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      wf.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {wf.is_active ? "Actif" : "Inactif"}
                  </span>
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
