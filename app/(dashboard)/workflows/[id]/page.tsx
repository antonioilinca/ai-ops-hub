import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { WORKFLOW_TEMPLATES } from "@/data/templates";
import DeleteWorkflowButton from "../DeleteWorkflowButton";

const TEMPLATE_MAP = Object.fromEntries(
  WORKFLOW_TEMPLATES.map((t) => [t.id, t])
);

export default async function WorkflowConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const { data: workflow } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", id)
    .eq("org_id", member.org_id)
    .single();

  if (!workflow) notFound();

  const template = TEMPLATE_MAP[workflow.type];
  const isOwnerOrAdmin = ["owner", "admin"].includes(member.role);

  // Recent runs
  const { data: runs } = await supabase
    .from("workflow_runs")
    .select("id, status, created_at, error, attempt")
    .eq("workflow_id", workflow.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <a
          href="/workflows"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour aux workflows
        </a>
      </div>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{template?.icon ?? "⚙️"}</span>
            <div>
              <h1 className="text-xl font-semibold">{workflow.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {template?.desc ?? workflow.type}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {template?.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              workflow.is_active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {workflow.is_active ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>

      {/* Config */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Configuration</h2>
        {template?.steps && template.steps.length > 0 ? (
          <div className="space-y-3">
            {template.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucune étape de configuration définie pour ce type de workflow.
          </p>
        )}
      </div>

      {/* Historique des exécutions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Historique des exécutions</h2>
        {!runs || runs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">
              Aucune exécution pour l&apos;instant.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {runs.map((run) => (
              <div
                key={run.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <RunStatusBadge status={run.status} />
                  <div>
                    <span className="text-sm font-medium">
                      Exécution #{run.attempt}
                    </span>
                    {run.error && (
                      <p className="text-xs text-red-500 mt-0.5 truncate max-w-xs">
                        {run.error}
                      </p>
                    )}
                  </div>
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
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {isOwnerOrAdmin && (
        <div className="flex gap-3">
          <DeleteWorkflowButton
            workflowId={workflow.id}
            workflowName={workflow.name}
          />
        </div>
      )}
    </div>
  );
}

function RunStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    running: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    retrying: "bg-orange-100 text-orange-700",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
