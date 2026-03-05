"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@/types";

interface SidebarProps {
  orgName: string;
  plan: string;
  role: Role;
}

const NAV_ITEMS = [
  { href: "/",              label: "Dashboard",   icon: "◉" },
  { href: "/workflows",    label: "Workflows",   icon: "⚡" },
  { href: "/integrations", label: "Intégrations",icon: "🔗" },
  { href: "/logs",         label: "Logs d'audit",icon: "📋", adminOnly: true },
  { href: "/settings/billing", label: "Facturation", icon: "💳" },
];

export function Sidebar({ orgName, plan, role }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = ["owner", "admin"].includes(role);

  return (
    <aside className="w-60 h-screen bg-card border-r border-border flex flex-col shrink-0">
      {/* Logo + Org */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
            O
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{orgName}</div>
            <div className="text-xs text-muted-foreground capitalize">{plan}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Rôle : <span className="font-medium capitalize">{role}</span>
        </div>
      </div>
    </aside>
  );
}
