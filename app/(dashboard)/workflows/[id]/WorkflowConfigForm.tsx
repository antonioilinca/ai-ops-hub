"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteWorkflowButton from "../DeleteWorkflowButton";

interface Field {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
}

export default function WorkflowConfigForm({
  workflowId,
  workflowName,
  fields,
  config,
  isOwnerOrAdmin,
}: {
  workflowId: string;
  workflowName: string;
  fields: Field[];
  config: Record<string, string>;
  isOwnerOrAdmin: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(config);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: values }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Erreur lors de la sauvegarde");
      }
      setMessage({ type: "success", text: "Configuration sauvegardée" });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur inconnue" });
    } finally {
      setSaving(false);
    }
  }

  async function handleRun() {
    setRunning(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Erreur lors du lancement");
      }
      setMessage({ type: "success", text: "Workflow lancé avec succès" });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur inconnue" });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h2 className="font-semibold">Configuration</h2>
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{field.label}</label>
          {field.type === "select" ? (
            <select
              value={values[field.key] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              disabled={!isOwnerOrAdmin}
              className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">{field.placeholder}</option>
              {field.placeholder.split(",").map((opt) => (
                <option key={opt.trim()} value={opt.trim().toLowerCase()}>
                  {opt.trim()}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={values[field.key] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              disabled={!isOwnerOrAdmin}
              className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          )}
        </div>
      ))}

      {message && (
        <div className={`text-sm px-3 py-2 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
          {message.text}
        </div>
      )}

      {isOwnerOrAdmin && (
        <>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Sauvegarde..." : "Enregistrer"}
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              {running ? "Lancement..." : "Tester maintenant"}
            </button>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <DeleteWorkflowButton
              workflowId={workflowId}
              workflowName={workflowName}
              onlyIcon={false}
            />
          </div>
        </>
      )}
    </div>
  );
}
