"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

type Org = {
  id: string; name: string; slug: string; plan: string;
  subscription_status: string; stripe_customer_id: string | null;
  stripe_subscription_id: string | null; created_at: string; updated_at: string;
};
type Member = {
  id: string; role: string; accepted_at: string | null; created_at: string;
  org_id: string; user_id: string;
  users: { id: string; email: string; full_name: string | null; created_at: string } | null;
};
type AuditLog = {
  id: string; user_id: string | null; org_id: string | null;
  action: string; resource_type: string | null; resource_id: string | null;
  metadata: Record<string, unknown> | null; ip_address: string | null; created_at: string;
};

const PLAN_COLORS: Record<string, string> = {
  free:       "bg-gray-100 text-gray-600",
  starter:    "bg-blue-100 text-blue-700",
  team:       "bg-indigo-100 text-indigo-700",
  enterprise: "bg-purple-100 text-purple-700",
};
const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  trialing: "bg-amber-100 text-amber-700",
  past_due: "bg-red-100 text-red-700",
  canceled: "bg-red-50 text-red-600",
};

const ACTION_LABELS: Record<string, string> = {
  "admin.create_user": "Création compte",
  "admin.delete_user": "Suppression compte",
  "admin.set_plan": "Changement plan",
  "admin.export": "Export données",
  "admin.revoke": "Révocation accès",
};

export default function AdminClient({
  orgs, members, logs, mrr, flash, searchQuery,
}: {
  orgs: Org[]; members: Member[]; logs: AuditLog[]; mrr: number;
  flash: { success?: string; error?: string };
  searchQuery: string;
}) {
  const [tab, setTab] = useState<"users" | "orgs" | "create" | "logs">("users");
  const [q, setQ] = useState(searchQuery);
  const [showPlanModal, setShowPlanModal] = useState<{ orgId: string; orgName: string; currentPlan: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Index org par id
  const orgById = useMemo(() => {
    const m: Record<string, Org> = {};
    orgs.forEach(o => (m[o.id] = o));
    return m;
  }, [orgs]);

  // Filtrage
  const filteredMembers = useMemo(() => {
    if (!q.trim()) return members;
    const lower = q.toLowerCase();
    return members.filter(m =>
      m.users?.email?.toLowerCase().includes(lower) ||
      m.users?.full_name?.toLowerCase().includes(lower) ||
      orgById[m.org_id]?.name?.toLowerCase().includes(lower)
    );
  }, [members, q, orgById]);

  const filteredOrgs = useMemo(() => {
    if (!q.trim()) return orgs;
    const lower = q.toLowerCase();
    return orgs.filter(o =>
      o.name.toLowerCase().includes(lower) ||
      o.slug.toLowerCase().includes(lower) ||
      o.plan.includes(lower)
    );
  }, [orgs, q]);

  // Stats
  const stats = {
    totalOrgs: orgs.length,
    totalUsers: new Set(members.map(m => m.user_id)).size,
    paying: orgs.filter(o => ["starter","team"].includes(o.plan) && o.subscription_status === "active").length,
    mrr,
  };

  // Delete handler
  async function handleDelete(userId: string, email: string) {
    if (!confirm(`⚠️ SUPPRESSION DÉFINITIVE\n\nSupprimer le compte de ${email} ?\n\nCette action est irréversible. Toutes les données associées (org si seul owner, workflows, etc.) seront supprimées.`)) return;
    setDeleting(userId);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.redirected) {
        window.location.href = res.url;
      } else if (!res.ok) {
        const data = await res.json();
        alert(`Erreur : ${data.error}`);
      } else {
        window.location.reload();
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Super Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Export buttons */}
            <a
              href="/api/admin/export?type=users"
              className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
            >
              Export Users CSV
            </a>
            <a
              href="/api/admin/export?type=orgs"
              className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
            >
              Export Orgs CSV
            </a>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Flash messages */}
        {flash.success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
            <span>✓</span> {flash.success}
          </div>
        )}
        {flash.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
            <span>✗</span> {flash.error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Organisations", value: stats.totalOrgs, icon: "🏢", color: "text-gray-900" },
            { label: "Utilisateurs", value: stats.totalUsers, icon: "👤", color: "text-gray-900" },
            { label: "Clients payants", value: stats.paying, icon: "💳", color: "text-indigo-600" },
            { label: "MRR estimé", value: `${stats.mrr}€`, icon: "💰", color: "text-green-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {([["users","Utilisateurs","👤"],["orgs","Organisations","🏢"],["logs","Audit Logs","📋"],["create","Créer un compte","+"]] as const).map(([id,label,icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          {tab !== "create" && tab !== "logs" && (
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Rechercher email, nom, org..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          )}
        </div>

        {/* Tab: Utilisateurs */}
        {tab === "users" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Tous les utilisateurs</h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{filteredMembers.length} résultats</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    {["Utilisateur","Organisation","Rôle","Plan","Statut","Stripe","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMembers.map((m) => {
                    const u = m.users;
                    const org = orgById[m.org_id];
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(u?.email?.[0] ?? "?").toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{u?.full_name ?? <span className="text-gray-400 italic">Sans nom</span>}</div>
                              <div className="text-xs text-gray-400">{u?.email ?? "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700">{org?.name ?? "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            m.role === "owner" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                          }`}>{m.role}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${PLAN_COLORS[org?.plan ?? "free"]}`}>
                            {org?.plan ?? "free"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[org?.subscription_status ?? "inactive"]}`}>
                            {org?.subscription_status ?? "inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {org?.stripe_customer_id ? (
                            <span className="text-xs text-gray-400 font-mono" title={org.stripe_customer_id}>
                              {org.stripe_customer_id.slice(0, 12)}…
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => org && setShowPlanModal({ orgId: org.id, orgName: org.name, currentPlan: org.plan })}
                              disabled={!org}
                              className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-40 font-medium"
                            >
                              Plan
                            </button>
                            <form action="/api/admin/revoke" method="POST" onSubmit={e => {
                              if (!confirm(`Révoquer l'accès de ${u?.email} ?`)) e.preventDefault();
                            }}>
                              <input type="hidden" name="userId" value={m.user_id} />
                              <input type="hidden" name="orgId" value={m.org_id} />
                              <button type="submit" className="text-xs px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors font-medium">
                                Révoquer
                              </button>
                            </form>
                            <button
                              onClick={() => handleDelete(m.user_id, u?.email ?? "inconnu")}
                              disabled={deleting === m.user_id}
                              className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-40"
                            >
                              {deleting === m.user_id ? "…" : "Supprimer"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMembers.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">Aucun résultat</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Organisations */}
        {tab === "orgs" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Toutes les organisations</h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{filteredOrgs.length} orgs</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    {["Organisation","Plan","Statut","Stripe customer","Stripe sub","Créée le","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{org.slug}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${PLAN_COLORS[org.plan]}`}>{org.plan}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[org.subscription_status]}`}>{org.subscription_status}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 font-mono">
                        {org.stripe_customer_id ? (
                          <a href={`https://dashboard.stripe.com/customers/${org.stripe_customer_id}`} target="_blank" rel="noopener" className="hover:text-indigo-600 transition-colors">
                            {org.stripe_customer_id.slice(0, 14)}…
                          </a>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 font-mono">
                        {org.stripe_subscription_id ? (
                          <a href={`https://dashboard.stripe.com/subscriptions/${org.stripe_subscription_id}`} target="_blank" rel="noopener" className="hover:text-indigo-600 transition-colors">
                            {org.stripe_subscription_id.slice(0, 14)}…
                          </a>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(org.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setShowPlanModal({ orgId: org.id, orgName: org.name, currentPlan: org.plan })}
                          className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                        >
                          Changer plan
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrgs.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">Aucune organisation</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Audit Logs */}
        {tab === "logs" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Journal d&apos;audit</h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{logs.length} entrées</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    {["Date","Action","Type","User ID","Détails"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600">{log.resource_type ?? "—"}</td>
                      <td className="px-5 py-3 text-xs text-gray-400 font-mono">
                        {log.user_id ? log.user_id.slice(0, 8) + "…" : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 max-w-xs truncate" title={log.metadata ? JSON.stringify(log.metadata) : ""}>
                        {log.metadata ? JSON.stringify(log.metadata).slice(0, 80) : "—"}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">Aucun log pour le moment</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Créer un compte */}
        {tab === "create" && (
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-1">Créer un compte client</h2>
              <p className="text-sm text-gray-500 mb-6">Le compte est créé avec email confirmé automatiquement — pas besoin de validation par email.</p>
              <form action="/api/admin/create-user" method="POST" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input name="email" type="email" required placeholder="client@entreprise.com"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Mot de passe
                      <span className="text-gray-400 font-normal ml-1">(optionnel — généré auto si vide)</span>
                    </label>
                    <input name="password" type="text" minLength={8} placeholder="min. 8 caractères"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Nom de l&apos;organisation <span className="text-red-500">*</span></label>
                    <input name="orgName" type="text" required placeholder="Acme Corp"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Plan</label>
                      <select name="plan" defaultValue="free"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white">
                        <option value="free">Free (0€)</option>
                        <option value="starter">Starter (29€)</option>
                        <option value="team">Team (79€)</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Statut</label>
                      <select name="status" defaultValue="active"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white">
                        <option value="active">Actif</option>
                        <option value="trialing">Essai</option>
                        <option value="inactive">Inactif</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit"
                  className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Créer le compte →
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Changer plan */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg mb-1">Changer le plan</h3>
            <p className="text-sm text-gray-500 mb-5">{showPlanModal.orgName}</p>
            <form action="/api/admin/set-plan" method="POST" className="space-y-4">
              <input type="hidden" name="orgId" value={showPlanModal.orgId} />
              <div>
                <label className="block text-sm font-medium mb-1.5">Nouveau plan</label>
                <select name="plan" defaultValue={showPlanModal.currentPlan}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
                  <option value="free">Free — 0€</option>
                  <option value="starter">Starter — 29€/mois</option>
                  <option value="team">Team — 79€/mois</option>
                  <option value="enterprise">Enterprise — sur devis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Statut abonnement</label>
                <select name="status" defaultValue="active"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
                  <option value="active">Actif ✓</option>
                  <option value="trialing">Essai gratuit</option>
                  <option value="past_due">Paiement en retard</option>
                  <option value="canceled">Annulé</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPlanModal(null)}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-indigo-700">
                  Appliquer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
