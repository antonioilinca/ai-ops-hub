"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50">
      <div className="text-4xl">😵</div>
      <h2 className="text-xl font-semibold">Erreur Admin</h2>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        {error.message || "Quelque chose s'est mal passé."}
      </p>
      <button
        onClick={reset}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
