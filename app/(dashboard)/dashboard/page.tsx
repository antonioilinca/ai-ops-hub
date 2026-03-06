import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WORKFLOW_TEMPLATES } from "@/data/templates";
import { FORM_TEMPLATES } from "@/data/forms";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const [{ count: workflowCount }, { count: runCount }, { data: recentRuns }] =
    await Promise.all([
      supabase
        .from("workflows")
        .select("*", { count: "exact", head: true })
        .eq("org_id", member.org_id)
        .eq("is_active", true),
      supabase
        .from("workflow_runs")
        .select("*", { count: "exact", head: true })
        .eq("org_id", member.org_id)
        .eq("status", "completed"),
      supabase
        .from("workflow_runs")
        .select("id, status, created_at, workflows(name, type)")
        .eq("org_id", member.org_id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Voici un aperçu de votre activité OpsAI
        </p>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Workflows actifs"
          value={workflowCount ?? 0}
          description="automatisations en cours"
          icon="⚡"
        />
        <StatCard
          title="Exécutions réussies"
          value={runCount ?? 0}
          description="tâches automatisées"
          icon="✅"
        />
        <StatCard
          title="Temps économisé"
          value={`~${Math.floor((runCount ?? 0) * 12)}min`}
          description="ce mois-ci"
          icon="⏱"
        />
      </div>

      {/* Accès rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAccessCard
          href="/templates"
          icon="📦"
          title="Templates"
          desc={`${WORKFLOW_TEMPLATES.length} templates prêts à l'emploi`}
          color="bg-indigo-50 border-indigo-100 hover:border-indigo-300"
        />
        <QuickAccessCard
          href="/forms"
          icon="📝"
          title="Formulaires"
          desc={`${FORM_TEMPLATES.length} modèles de formulaires`}
          color="bg-emerald-50 border-emerald-100 hover:border-emerald-300"
        />
        <QuickAccessCard
          href="/formation"
          icon="🎓"
          title="Academy"
          desc="Formations IA pour votre équipe"
          color="bg-violet-50 border-violet-100 hover:border-violet-300"
          badge="NEW"
        />
      </div>

      {/* Activité récente */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-medium mb-4">Activité récente</h2>
        {!recentRuns || recentRuns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-4xl mb-2">🚀</p>
            <p className="text-sm">Aucune exécution pour l&apos;instant.</p>
            <a href="/templates" className="text-primary text-sm mt-1 inline-block hover:underline">
              Explorer les templates pour démarrer →
            </a>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentRuns.map((run) => {
              const wf = (run.workflows as unknown) as { name: string; type: string } | null;
              return (
                <div key={run.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={run.status} />
                    <span className="text-sm font-medium">{wf?.name ?? "Workflow"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(run.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </div>
  );
}

function QuickAccessCard({
  href,
  icon,
  title,
  desc,
  color,
  badge,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
  badge?: string;
}) {
  return (
    <a
      href={href}
      className={`border rounded-xl p-5 transition-all hover:shadow-sm ${color}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-semibold text-sm">{title}</span>
        {badge && (
          <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold ml-auto">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </a>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    running: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    retrying: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
