import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import WorkflowConfigForm from "./WorkflowConfigForm";

const WORKFLOW_META: Record<string, { label: string; icon: string; fields: { key: string; label: string; placeholder: string; type?: string }[] }> = {
  email_triage: {
    label: "Triage d'emails", icon: "📧",
    fields: [
      { key: "inbox_label", label: "Label boîte mail à surveiller", placeholder: "INBOX, Support, ..." },
      { key: "auto_reply",  label: "Réponse automatique", placeholder: "oui / non", type: "select" },
      { key: "priority_keywords", label: "Mots-clés prioritaires", placeholder: "urgent, important, facture" },
    ],
  },
  meeting_summary: {
    label: "Compte-rendu réunion", icon: "🎙",
    fields: [
      { key: "language",       label: "Langue des réunions", placeholder: "Français" },
      { key: "output_channel", label: "Où envoyer le CR ?", placeholder: "Notion, Slack, Email..." },
      { key: "participants",   label: "Participants habituels", placeholder: "team@exemple.com" },
    ],
  },
  weekly_report: {
    label: "Rapport hebdomadaire", icon: "📊",
    fields: [
      { key: "send_day",    label: "Jour d'envoi", placeholder: "Lundi" },
      { key: "send_time",   label: "Heure d'envoi", placeholder: "08:00" },
      { key: "recipients",  label: "Destinataires", placeholder: "équipe@exemple.com" },
    ],
  },
  proposal_generator: {
    label: "Générateur de propale", icon: "📄",
    fields: [
      { key: "company_name", label: "Nom de votre entreprise", placeholder: "OpsAI SAS" },
      { key: "tone",         label: "Ton souhaité", placeholder: "Professionnel, Conversationnel..." },
      { key: "template_url", label: "Modèle de référence (URL Drive)", placeholder: "https://docs.google.com/..." },
    ],
  },
  qa_bot: {
    label: "Base de connaissance IA", icon: "💬",
    fields: [
      { key: "source_folder", label: "Dossier source des documents", placeholder: "URL Google Drive ou Notion" },
      { key: "bot_name",      label: "Nom du bot", placeholder: "Assistant OpsAI" },
      { key: "fallback_email",label: "Email si le bot ne sait pas", placeholder: "support@exemple.com" },
    ],
  },
  lead_qualifier: {
    label: "Qualification de leads", icon: "🎯",
    fields: [
      { key: "crm",           label: "CRM utilisé", placeholder: "HubSpot, Salesforce..." },
      { key: "score_threshold",label: "Score minimum (1-10)", placeholder: "7" },
      { key: "notify_email",  label: "Notifier par email", placeholder: "sales@exemple.com" },
    ],
  },
};

export default async function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();
  if (!member) redirect("/onboarding");

  const { data: wf } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", id)
    .eq("org_id", member.org_id)
    .single();
  if (!wf) notFound();

  const { data: runs } = await supabase
    .from("workflow_runs")
    .select("id, status, created_at, completed_at, error")
    .eq("workflow_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const meta = WORKFLOW_META[wf.type] ?? { label: wf.type, icon: "⚙️", fields: [] };
  const isOwnerOrAdmin = ["owner", "admin"].includes(member.role);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <a href="/workflows" className="text-sm text-muted-foreground hover:text-foreground">← Retour aux workflows</a>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-3xl">{meta.icon}</span>
          <div>
            <h1 className="text-2xl font-semibold">{wf.name}</h1>
            <p className="text-sm text-muted-foreground">{meta.label}</p>
          </div>
          <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${wf.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {wf.is_active ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>

      {/* Config */}
      <WorkflowConfigForm
        workflowId={id}
        fields={meta.fields}
        config={(wf.config as Record<string, string>) ?? {}}
        isOwnerOrAdmin={isOwnerOrAdmin}
      />

      {/* Historique d'exécutions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Dernières exécutions</h2>
        </div>
        {!runs || runs.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            Aucune exécution encore. Testez ce workflow pour commencer.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {runs.map((run) => (
              <div key={run.id} className="px-6 py-3 flex items-center gap-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  run.status === "completed" ? "bg-green-100 text-green-700"
                  : run.status === "failed"   ? "bg-red-100 text-red-700"
                  : run.status === "running"  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
                }`}>
                  {run.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(run.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                {run.error && <span className="text-xs text-red-500 truncate flex-1">{run.error}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
