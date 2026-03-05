import { createAdminClient } from "@/lib/supabase/server";

// ─── Types d'actions audit ────────────────────────────────────────────────────
// Convention: "resource.action"

export type AuditAction =
  // Workflows
  | "workflow.created"
  | "workflow.updated"
  | "workflow.deleted"
  | "workflow.activated"
  | "workflow.deactivated"
  | "workflow.run_started"
  | "workflow.run_completed"
  | "workflow.run_failed"
  // Members
  | "member.invited"
  | "member.role_changed"
  | "member.removed"
  | "member.joined"
  // Integrations
  | "integration.connected"
  | "integration.disconnected"
  // Auth
  | "auth.login"
  | "auth.logout"
  // Billing
  | "billing.plan_upgraded"
  | "billing.plan_downgraded"
  | "billing.subscription_canceled"
  // Documents
  | "document.uploaded"
  | "document.deleted"
  // Org
  | "org.created"
  | "org.updated"
  | "org.settings_changed";

interface AuditParams {
  orgId: string;
  userId?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// ─── Logger principal ─────────────────────────────────────────────────────────
// Utilise le client admin (service_role) pour écrire même si l'user n'a pas
// les permissions de SELECT sur audit_logs

export async function logAudit(params: AuditParams): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("audit_logs").insert({
    org_id:        params.orgId,
    user_id:       params.userId ?? null,
    action:        params.action,
    resource_type: params.resourceType ?? null,
    resource_id:   params.resourceId ?? null,
    metadata:      params.metadata ?? {},
    ip_address:    params.ipAddress ?? null,
    user_agent:    params.userAgent ?? null,
  });

  // Ne jamais faire planter l'app à cause d'un log
  if (error) {
    console.error("[audit] Erreur d'écriture:", error.message);
  }
}

// ─── Helper: extraire IP et User-Agent d'une Request ─────────────────────────

export function getRequestMeta(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;
  return { ipAddress: ip, userAgent };
}
