import { Role, Plan } from "@/types";

// ─── Matrice des permissions ──────────────────────────────────────────────────
// Définit ce que chaque rôle peut faire

type Permission =
  | "workflow:read"
  | "workflow:create"
  | "workflow:update"
  | "workflow:delete"
  | "workflow:run"
  | "integration:read"
  | "integration:manage"
  | "member:read"
  | "member:invite"
  | "member:remove"
  | "audit:read"
  | "billing:read"
  | "billing:manage"
  | "org:update"
  | "org:delete"
  | "document:read"
  | "document:manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "workflow:read", "workflow:create", "workflow:update", "workflow:delete", "workflow:run",
    "integration:read", "integration:manage",
    "member:read", "member:invite", "member:remove",
    "audit:read",
    "billing:read", "billing:manage",
    "org:update", "org:delete",
    "document:read", "document:manage",
  ],
  admin: [
    "workflow:read", "workflow:create", "workflow:update", "workflow:delete", "workflow:run",
    "integration:read", "integration:manage",
    "member:read", "member:invite",
    "audit:read",
    "billing:read",
    "org:update",
    "document:read", "document:manage",
  ],
  member: [
    "workflow:read", "workflow:create", "workflow:update", "workflow:run",
    "integration:read",
    "member:read",
    "document:read", "document:manage",
  ],
  viewer: [
    "workflow:read",
    "integration:read",
    "member:read",
    "document:read",
  ],
};

// ─── Limites par plan ─────────────────────────────────────────────────────────

const PLAN_LIMITS: Record<Plan, { maxWorkflows: number; maxMembers: number; maxDocuments: number }> = {
  free:       { maxWorkflows: 2,   maxMembers: 1,   maxDocuments: 5 },
  starter:    { maxWorkflows: 5,   maxMembers: 3,   maxDocuments: 20 },
  team:       { maxWorkflows: 20,  maxMembers: 15,  maxDocuments: 100 },
  enterprise: { maxWorkflows: 999, maxMembers: 999, maxDocuments: 999 },
};

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Permission refusée: ${permission} (rôle: ${role})`);
  }
}

export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan];
}

export function canUpgrade(role: Role): boolean {
  return role === "owner";
}

// Rôles avec permission d'écriture
export function isWriteRole(role: Role): boolean {
  return ["owner", "admin", "member"].includes(role);
}

export function isAdminRole(role: Role): boolean {
  return ["owner", "admin"].includes(role);
}

// ─── Erreurs RBAC typées ──────────────────────────────────────────────────────

export class PermissionError extends Error {
  constructor(permission: string, role: Role) {
    super(`Accès refusé: '${permission}' requiert un rôle supérieur à '${role}'`);
    this.name = "PermissionError";
  }
}

export class PlanLimitError extends Error {
  constructor(resource: string, limit: number, plan: Plan) {
    super(`Limite atteinte: ${resource} (max ${limit} sur le plan ${plan})`);
    this.name = "PlanLimitError";
  }
}
