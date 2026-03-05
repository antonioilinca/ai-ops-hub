"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TEMPLATES = [
  {
    type: "email_triage",
    name: "Triage d'emails",
    icon: "📧",
    desc: "Classe automatiquement vos emails entrants par priorité et génère des réponses types.",
    tags: ["Gmail", "Outlook", "IA"],
    time: "~5 min de config",
  },
  {
    type: "meeting_summary",
    name: "Compte-rendu réunion",
    icon: "🎙",
    desc: "Transcrit vos réunions, identifie les décisions et génère les tâches à faire.",
    tags: ["Audio", "Notion", "Slack"],
    time: "~3 min de config",
  },
  {
    type: "weekly_report",
    name: "Rapport hebdomadaire",
    icon: "📊",
    desc: "Compile automatiquement vos métriques et envoie un résumé chaque lundi matin.",
    tags: ["Analytics", "Email", "Slack"],
    time: "~8 min de config",
  },
  {
    type: "proposal_generator",
    name: "Générateur de propale",
    icon: "📄",
    desc: "Génère des propositions commerciales personnalisées depuis un brief client.",
    tags: ["HubSpot", "Drive", "IA"],
    time: "~10 min de config",
  },
  {
    type: "qa_bot",
    name: "Base de connaissance IA",
    icon: "💬",
    desc: "Répondez aux questions de vos équipes ou clients depuis vos documents internes.",
    tags: ["Documents", "Slack", "IA"],
    time: "~15 min de config",
  },
  {
    type: "lead_qualifier",
    name: "Qualification de leads",
    icon: "🎯",
    desc: "Analyse et score automatiquement vos nouveaux leads entrants.",
    tags: ["HubSpot", "Gmail", "IA"],
    time: "~12 min de config",
  },
];

function NewWorkflowForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("type");

  const [selected, setSelected] = useState<string | null>(preselected);
  const [name, setName]         = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const handleCreate = async () => {
    if (!selected) { setError("Choisissez un template"); return; }
    if (!name.trim()) { setError("Donnez un nom à ce workflow"); return; }
    setSaving(true);
    setError("");

    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: selected, name: name.trim() }),
    });

    if (res.ok) {
      router.push("/workflows");
    } else {
      const d = await res.json();
      setError(d.error ?? "Erreur lors de la création");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <a href="/workflows" className="text-sm text-muted-foreground hover:text-foreground">← Retour</a>
        <h1 className="text-2xl font-semibold mt-2">Nouveau workflow</h1>
        <p className="text-sm text-muted-foreground mt-1">Choisissez un template pour démarrer rapidement</p>
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.type}
            onClick={() => { setSelected(t.type); setName(t.name); }}
            className={`text-left border rounded-xl p-5 transition-all ${
              selected === t.type
                ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                : "border-border bg-card hover:border-indigo-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{t.name}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {t.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{tag}</span>
                  ))}
                  <span className="text-xs text-indigo-500 ml-auto">{t.time}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Nom du workflow */}
      {selected && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Nommez votre workflow</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Triage emails clients"
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-background"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Création..." : "Créer ce workflow →"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function NewWorkflowPage() {
  return (
    <Suspense>
      <NewWorkflowForm />
    </Suspense>
  );
}
