import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { hasPermission, PlanLimitError } from "@/lib/rbac";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { enqueueWorkflowRun } from "@/lib/queue";
import { getPlanLimits } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// ─── GET /api/workflows — liste les workflows de l'org ───────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("workflows")
      .select("*")
      .eq("org_id", session.orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    const status = msg === "Non authentifié" ? 401 : 500;
    return NextResponse.json({ data: null, error: msg }, { status });
  }
}

// ─── POST /api/workflows — crée un workflow ──────────────────────────────────
const CreateWorkflowSchema = z.object({
  name:   z.string().min(1).max(100),
  type:   z.enum(["email_triage", "meeting_summary", "weekly_report", "proposal_generator", "qa_bot"]),
  config: z.record(z.unknown()).default({}),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    // Vérification permission
    if (!hasPermission(session.role, "workflow:create")) {
      return NextResponse.json({ data: null, error: "Permission refusée" }, { status: 403 });
    }

    // Vérification limite du plan
    const admin = createAdminClient();
    const { count } = await admin
      .from("workflows")
      .select("*", { count: "exact", head: true })
      .eq("org_id", session.orgId);

    const limits = getPlanLimits(session.plan);
    if ((count ?? 0) >= limits.maxWorkflows) {
      throw new PlanLimitError("workflows", limits.maxWorkflows, session.plan);
    }

    // Validation du body
    const body = await req.json();
    const parsed = CreateWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await admin
      .from("workflows")
      .insert({
        org_id:     session.orgId,
        name:       parsed.data.name,
        type:       parsed.data.type,
        config:     parsed.data.config,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Log d'audit
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      orgId: session.orgId,
      userId: user?.id,
      action: "workflow.created",
      resourceType: "workflow",
      resourceId: data.id,
      metadata: { name: data.name, type: data.type },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    const status = msg === "Non authentifié" ? 401 : msg.includes("Limite") ? 402 : 500;
    return NextResponse.json({ data: null, error: msg }, { status });
  }
}
