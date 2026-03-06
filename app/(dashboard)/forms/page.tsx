"use client";

import { useState } from "react";
import { FORM_TEMPLATES, FORM_CATEGORIES, FormTemplate, FormField } from "@/data/forms";

export default function FormsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);

  const filtered = FORM_TEMPLATES.filter((f) => {
    const matchCat = !activeCategory || f.category === activeCategory;
    const matchSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const popular = FORM_TEMPLATES.filter((f) => f.popular);

  if (selectedForm) {
    return <FormPreview form={selectedForm} onBack={() => setSelectedForm(null)} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Formulaires</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Créez des formulaires pour collecter des données, déclencher des workflows et automatiser vos process.
          </p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un formulaire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 border border-border rounded-lg px-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-300 pl-9"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
        </div>
      </div>

      {/* Popular section */}
      {!activeCategory && !search && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>⭐</span> Les plus utilisés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popular.map((f) => (
              <FormCard key={f.id} form={f} onSelect={setSelectedForm} compact />
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
        {FORM_CATEGORIES.map((cat) => (
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Aucun formulaire trouvé pour cette recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <FormCard key={f.id} form={f} onSelect={setSelectedForm} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Card Component ─── */
function FormCard({
  form,
  onSelect,
  compact = false,
}: {
  form: FormTemplate;
  onSelect: (f: FormTemplate) => void;
  compact?: boolean;
}) {
  const category = FORM_CATEGORIES.find((c) => c.id === form.category);

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{form.icon}</span>
        {form.popular && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            Populaire
          </span>
        )}
      </div>

      <h3 className="font-semibold text-sm text-foreground mb-1">{form.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{form.desc}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {!compact && category && (
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            {category.label}
          </span>
        )}
        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
          {form.fields.length} champs
        </span>
        <span className="text-xs text-indigo-500 ml-auto">
          {form.fields.filter((f) => f.required).length} requis
        </span>
      </div>

      <div className="mt-auto pt-2">
        <button
          onClick={() => onSelect(form)}
          className="w-full bg-indigo-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Voir & Personnaliser →
        </button>
      </div>
    </div>
  );
}

/* ─── Preview / Builder Component ─── */
function FormPreview({
  form,
  onBack,
}: {
  form: FormTemplate;
  onBack: () => void;
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const renderField = (field: FormField) => {
    const baseClass =
      "w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-300";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            className={`${baseClass} min-h-[100px] resize-y`}
            placeholder={field.placeholder}
            value={formData[field.id] ?? ""}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
          />
        );
      case "select":
        return (
          <select
            className={baseClass}
            value={formData[field.id] ?? ""}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
          >
            <option value="">Sélectionnez...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="rounded border-border"
              checked={formData[field.id] === "true"}
              onChange={(e) => setFormData({ ...formData, [field.id]: String(e.target.checked) })}
            />
            {field.label}
          </label>
        );
      case "file":
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm hover:border-indigo-300 transition-colors cursor-pointer">
            <p className="text-2xl mb-2">📎</p>
            <p>Cliquez ou glissez un fichier ici</p>
          </div>
        );
      default:
        return (
          <input
            type={field.type}
            className={baseClass}
            placeholder={field.placeholder}
            value={formData[field.id] ?? ""}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour aux formulaires
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: form config info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <span className="text-4xl block mb-3">{form.icon}</span>
            <h2 className="text-lg font-semibold mb-1">{form.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{form.desc}</p>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Champs</span>
                <span className="font-semibold text-foreground">{form.fields.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Requis</span>
                <span className="font-semibold text-foreground">{form.fields.filter((f) => f.required).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Catégorie</span>
                <span className="font-semibold text-foreground">
                  {FORM_CATEGORIES.find((c) => c.id === form.category)?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-indigo-800 mb-2">Que se passe-t-il ensuite ?</h3>
            <ul className="text-xs text-indigo-700 space-y-1.5">
              <li>1. Les soumissions arrivent dans votre dashboard</li>
              <li>2. L&apos;IA analyse et classe les réponses</li>
              <li>3. Déclenchez un workflow automatiquement</li>
              <li>4. Recevez des notifications en temps réel</li>
            </ul>
          </div>
        </div>

        {/* Right: live form preview */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-sm">Aperçu du formulaire</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Mode preview
              </span>
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">✅</p>
                <h3 className="font-semibold text-lg mb-1">Formulaire envoyé !</h3>
                <p className="text-sm text-muted-foreground">
                  Les données seront traitées par votre workflow IA.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {form.fields.map((field) => (
                  <div key={field.id}>
                    {field.type !== "checkbox" && (
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                      </label>
                    )}
                    {renderField(field)}
                  </div>
                ))}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  Envoyer le formulaire
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
