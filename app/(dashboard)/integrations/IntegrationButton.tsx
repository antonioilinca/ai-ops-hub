"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IntegrationButton({
  provider,
  isConnected,
  isConfigured,
}: {
  provider: string;
  isConnected: boolean;
  /** true si les credentials OAuth sont configurées côté serveur */
  isConfigured: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function handleConnect() {
    if (!isConfigured) {
      setMessage("Bientôt disponible");
      setTimeout(() => setMessage(null), 2500);
      return;
    }
    setLoading(true);
    window.location.href = `/api/integrations/${provider}/authorize`;
  }

  async function handleDisconnect() {
    if (!confirm(`Déconnecter ${provider} ? Les workflows utilisant cette intégration ne fonctionneront plus.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${provider}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage("Déconnecté");
        setTimeout(() => {
          setMessage(null);
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        setMessage(data.error ?? "Erreur");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage("Erreur réseau");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  }

  // Provider webhook → bouton spécial
  if (provider === "webhook") {
    return (
      <button
        disabled
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 cursor-default"
      >
        Configurer dans Workflows
      </button>
    );
  }

  // Provider non configuré (pas de client ID/secret) → bouton grisé propre
  if (!isConfigured && !isConnected) {
    return (
      <div className="relative">
        <button
          onClick={handleConnect}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Bientôt disponible
        </button>
        {message && (
          <div className="absolute top-full left-0 mt-1.5 z-10 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={loading}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
          isConnected
            ? "bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {loading
          ? "..."
          : isConnected
          ? "Déconnecter"
          : "Connecter"}
      </button>
      {message && (
        <div className="absolute top-full left-0 mt-1.5 z-10 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}
