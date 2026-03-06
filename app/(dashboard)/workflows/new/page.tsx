"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { WORKFLOW_TEMPLATES, TEMPLATE_CATEGORIES } from "@/data/templates";

function NewWorkflowForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("type");

  const [selected, setSelected] = useState<string | null>(preselected);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filtered = categoryFilter
    ? WORKFLOW_TEMPLATES.filter((t) => t.category === categoryFilter)
    : WORKFLOW_TEMPLATES;

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
    <div className="max-w-4xl space-y-8">
      <div>
        <a href="/workflows" className="text-sm text-muted-foreground hover:text-foreground">← Retour</a>
        <h1 className="text-2xl font-semibold mt-2">Nouveau workflow</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choisissez un template pour démarrer rapidement — {WORKFLOW_TEMPLATES.length} templates disponibles
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            !categoryFilter ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Tous
        </button>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              categoryFilter === cat.id
                ? "bg-indigo-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => { setSelected(t.id); setName(t.name); }}
            className={`text-left border rounded-xl p-5 transition-all ${
              selected === t.id
                ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                : "border-border bg-card hover:border-indigo-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{t.name}</span>
                  {t.popular && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                      Populaire
                    </span>
                  )}
                </div>
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
