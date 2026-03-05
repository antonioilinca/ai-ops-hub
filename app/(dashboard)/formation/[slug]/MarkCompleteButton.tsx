"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  courseSlug: string;
  lessonId?: string;
  isCompleted: boolean;
  label?: string;
}

export default function MarkCompleteButton({
  courseSlug,
  lessonId,
  isCompleted,
  label,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(isCompleted);

  async function handleClick() {
    if (done || loading) return;
    setLoading(true);

    const res = await fetch("/api/formation/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, lessonId: lessonId ?? null }),
    });

    if (res.ok) {
      setDone(true);
      router.refresh();
    }
    setLoading(false);
  }

  if (done) {
    return (
      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        {label ?? "Terminé"}
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-indigo-500 hover:text-indigo-700 font-medium shrink-0 disabled:opacity-50"
    >
      {loading ? "..." : "Marquer terminé ✓"}
    </button>
  );
}
