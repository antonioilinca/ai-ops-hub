"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: { email: string; id: string };
  orgName: string;
}

export function Header({ user, orgName }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      <div />

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
          <span className="text-sm text-muted-foreground hidden md:block">
            {user.email}
          </span>
          <span className="text-muted-foreground text-xs">▾</span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-10 z-20 w-48 bg-card border border-border rounded-xl shadow-lg py-1">
              <div className="px-3 py-2 border-b border-border">
                <div className="text-xs font-medium truncate">{user.email}</div>
              </div>
              <a
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                ⚙ Paramètres
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                ↩ Déconnexion
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
