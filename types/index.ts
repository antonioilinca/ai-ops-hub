// ─── Tenant / Org ───────────────────────────────────────────────────────────

export type Plan = "free" | "starter" | "team" | "enterprise";
export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "trialing"
  | "past_due"
  | "canceled";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

// ─── Users & RBAC ───────────────────────────────────────────────────────────

export type Role = "owner" | "admin" | "member" | "viewer";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: Role;
  accepted_at: string | null;
  created_at: string;
  // joins
  user?: User;
  organization?: Organization;
}

// ─── Workflows ──────────────────────────────────────────────────────────────

export type WorkflowType =
  | "email_triage"
  | "meeting_summary"
  | "weekly_report"
  | "proposal_generator"
  | "qa_bot"
  | "lead_qualifier"
  | "follow_up_sequence"
  | "process_checklist"
  | "employee_onboarding"
  | "leave_request"
  | "candidate_screening"
  | "content_brief"
  | "event_registration"
  | "expense_report"
  | "invoice_request"
  | "ticket_support"
  | "feedback_collector";

export type WorkflowRunStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "retrying";

export interface Workflow {
  id: string;
  org_id: string;
  name: string;
  type: WorkflowType;
  config: Record<string, unknown>;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRun {
  id: string;
  org_id: string;
  workflow_id: string;
  status: WorkflowRunStatus;
  trigger: string | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  attempt: number;
  idempotency_key: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// ─── Audit Logs ─────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  org_id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  // join
  user?: Pick<User, "email" | "full_name">;
}

// ─── Documents / RAG ────────────────────────────────────────────────────────

export interface Document {
  id: string;
  org_id: string;
  name: string;
  source: string | null;
  source_id: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

// ─── API Responses ──────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

// ─── Session context ────────────────────────────────────────────────────────

export interface SessionContext {
  userId: string;
  orgId: string;
  role: Role;
  plan: Plan;
}

// ─── Stripe Plans ───────────────────────────────────────────────────────────

export const PLANS: Record<
  Plan,
  { name: string; price: number; maxMembers: number; maxWorkflows: number }
> = {
  free:       { name: "Gratuit",    price: 0,  maxMembers: 1,   maxWorkflows: 2   },
  starter:    { name: "Starter",    price: 29, maxMembers: 3,   maxWorkflows: 5   },
  team:       { name: "Team",       price: 79, maxMembers: 15,  maxWorkflows: 20  },
  enterprise: { name: "Enterprise", price: 0,  maxMembers: 999, maxWorkflows: 999 },
};
