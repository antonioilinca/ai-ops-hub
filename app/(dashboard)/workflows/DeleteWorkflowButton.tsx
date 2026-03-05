"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteWorkflowButtonProps {
  workflowId: string;
  workflowName: string;
  onlyIcon?: boolean;
}

export default function DeleteWorkflowButton({
  workflowId,
  workflowName,
  onlyIcon = false,
}: DeleteWorkflowButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Erreur lors de la suppression");
      }
      router.push("/workflows");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsDeleting(false);
    }
  }

  if (onlyIcon) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="text-red-600 hover:text-red-700 transition-colors p-1"
          title="Supprimer ce workflow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
              <h3 className="font-semibold text-lg">Supprimer ce workflow?</h3>
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer <strong>{workflowName}</strong>? Cette action est irréversible.
              </p>
              {error && (
                <div className="text-sm bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        disabled={isDeleting}
      >
        {isDeleting ? "Suppression en cours..." : "Supprimer ce workflow"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
            <h3 className="font-semibold text-lg">Supprimer ce workflow?</h3>
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer <strong>{workflowName}</strong>? Cette action est irréversible.
            </p>
            {error && (
              <div className="text-sm bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="flex-1 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
