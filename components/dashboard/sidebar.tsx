"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@/types";
import { LogoMark } from "@/components/logo";

interface SidebarProps {
  orgName: string;
  plan: string;
  role: Role;
  isSuperAdmin?: boolean;
}

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { href: "/dashboard",     label: "Dashboard",    icon: "◉" },
    ],
  },
  {
    label: "Automatisation",
    items: [
      { href: "/workflows",     label: "Workflows",    icon: "⚡" },
      { href: "/templates",    label: "Templates",    icon: "📦" },
      { href: "/forms",        label: "Formulaires",  icon: "📝" },
      { href: "/logs",          label: "Logs d'audit", icon: "📋", adminOnly: true },
    ],
  },
  {
    label: "Formation",
    items: [
      { href: "/formation",     label: "Academy",      icon: "🎓" },
    ],
  },
  {
    label: "Compte",
    items: [
      { href: "/settings/billing", label: "Facturation", icon: "💳" },
    ],
  },
];

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  free:       { label: "Gratuit",    color: "bg-gray-100 text-gray-500" },
  starter:    { label: "Starter",    color: "bg-blue-100 text-blue-700" },
  team:       { label: "Team",       color: "bg-indigo-100 text-indigo-700" },
  enterprise: { label: "Enterprise", color: "bg-purple-100 text-purple-700" },
};

export function Sidebar({ orgName, plan, role, isSuperAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin  = ["owner", "admin"].includes(role);
  const badge    = PLAN_BADGE[plan] ?? PLAN_BADGE.free;

  return (
    <aside className="w-60 h-screen bg-card border-r border-border flex flex-col shrink-0 sticky top-0">
      {/* Logo + Org */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <LogoMark size={32} />
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{orgName}</div>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label ?? "main"}>
            {section.label && (
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1.5">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                if ("adminOnly" in item && item.adminOnly && !isAdmin) return null;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="text-base w-5 text-center">{item.icon}</span>
                    {item.label}
                    {item.href === "/formation" && (
                      <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Super Admin */}
      {isSuperAdmin && (
        <div className="px-3 pb-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1.5">
            Super Admin
          </div>
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === "/admin"
                ? "bg-red-100 text-red-700 font-semibold"
                : "text-red-500 hover:bg-red-50 hover:text-red-700"
            }`}
          >
            <span className="text-base w-5 text-center">🛡️</span>
            Administration
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="text-xs text-muted-foreground">
          Rôle : <span className="font-semibold capitalize">{isSuperAdmin ? "Super Admin" : role}</span>
        </div>
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground block">
          ← Accueil
        </Link>
      </div>
    </aside>
  );
}
