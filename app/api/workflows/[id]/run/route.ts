import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { enqueueWorkflowRun } from "@/lib/queue";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

// POST /api/workflows/[id]/run — déclenche manuellement un workflow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();

    if (!hasPermission(session.role, "workflow:run")) {
      return NextResponse.json({ data: null, error: "Permission refusée" }, { status: 403 });
    }

    const admin = createAdminClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Vérifie que le workflow appartient à l'org
    const { data: workflow, error: wfError } = await admin
      .from("workflows")
      .select("id, name, type, config, is_active")
      .eq("id", id)
      .eq("org_id", session.orgId)
      .single();

    if (wfError || !workflow) {
      return NextResponse.json({ data: null, error: "Workflow introuvable" }, { status: 404 });
    }

    if (!workflow.is_active) {
      return NextResponse.json({ data: null, error: "Workflow inactif" }, { status: 400 });
    }

    const input = await req.json().catch(() => ({}));

    // Crée un run en DB (statut pending)
    const idempotencyKey = `${id}:${Date.now()}:${uuidv4().slice(0, 8)}`;
    const { data: run, error: runError } = await admin
      .from("workflow_runs")
      .insert({
        org_id:          session.orgId,
        workflow_id:     id,
        status:          "pending",
        trigger:         "manual",
        input,
        idempotency_key: idempotencyKey,
      })
      .select()
      .single();

    if (runError) throw runError;

    // Enfile le job dans BullMQ (idempotent via jobId)
    await enqueueWorkflowRun(
      {
        runId:      run.id,
        orgId:      session.orgId,
        workflowId: id,
        type:       workflow.type,
        input,
        config:     workflow.config as Record<string, unknown>,
      },
      idempotencyKey
    );

    // Log d'audit
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      orgId:        session.orgId,
      userId:       user?.id,
      action:       "workflow.run_started",
      resourceType: "workflow_run",
      resourceId:   run.id,
      metadata:     { workflow_id: id, trigger: "manual" },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ data: { runId: run.id, status: "pending" }, error: null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    const status = msg === "Non authentifié" ? 401 : 500;
    return NextResponse.json({ data: null, error: msg }, { status });
  }
}
