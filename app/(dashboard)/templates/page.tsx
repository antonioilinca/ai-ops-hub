"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WORKFLOW_TEMPLATES, TEMPLATE_CATEGORIES } from "@/data/templates";

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState<string | null>(null);
  const router = useRouter();

  const filtered = WORKFLOW_TEMPLATES.filter((t) => {
    const matchCat = !activeCategory || t.category === activeCategory;
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const popular = WORKFLOW_TEMPLATES.filter((t) => t.popular);

  const handleUseTemplate = async (templateId: string, templateName: string) => {
    setCreating(templateId);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: templateId, name: templateName }),
      });
      if (res.ok) {
        router.push("/workflows");
      } else {
        const d = await res.json();
        alert(d.error ?? "Erreur lors de la création");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choisissez un template prêt à l&apos;emploi et lancez votre workflow en quelques minutes
          </p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 border border-border rounded-lg px-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-300 pl-9"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
        </div>
      </div>

      {/* Popular section (only when no filter) */}
      {!activeCategory && !search && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>⭐</span> Les plus populaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popular.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                creating={creating}
                onUse={handleUseTemplate}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            !activeCategory
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Tout
        </button>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeCategory === cat.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Aucun template trouvé pour cette recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              creating={creating}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template: t,
  creating,
  onUse,
  compact = false,
}: {
  template: (typeof WORKFLOW_TEMPLATES)[number];
  creating: string | null;
  onUse: (id: string, name: string) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const category = TEMPLATE_CATEGORIES.find((c) => c.id === t.category);

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{t.icon}</span>
        {t.popular && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            Populaire
          </span>
        )}
      </div>

      <h3 className="font-semibold text-sm text-foreground mb-1">{t.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {!compact && category && (
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            {category.label}
          </span>
        )}
        {t.tags.slice(0, compact ? 2 : 3).map((tag) => (
          <span
            key={tag}
            className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
          >
            {tag}
          </span>
        ))}
        <span className="text-xs text-indigo-500 ml-auto">{t.time}</span>
      </div>

      {/* Steps (expandable) */}
      {!compact && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 text-left"
          >
            {expanded ? "▾ Masquer les étapes" : "▸ Voir les étapes du workflow"}
          </button>
          {expanded && (
            <div className="mb-3 space-y-1.5">
              {t.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Action */}
      <div className="mt-auto pt-2">
        <button
          onClick={() => onUse(t.id, t.name)}
          disabled={creating === t.id}
          className="w-full bg-indigo-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {creating === t.id ? "Création..." : "Utiliser ce template →"}
        </button>
      </div>
    </div>
  );
}
