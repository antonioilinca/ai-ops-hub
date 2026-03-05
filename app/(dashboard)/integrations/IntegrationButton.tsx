"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IntegrationButton({
  provider,
  isConnected,
}: {
  provider: string;
  isConnected: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function handleConnect() {
    setLoading(true);
    // Redirige vers l'endpoint OAuth authorize
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
