import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateConfigSchema = z.object({
  config: z.record(z.string()),
});

// PATCH /api/workflows/[id] — update workflow config
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();

    if (!hasPermission(session.role, "workflow:update")) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Config invalide" }, { status: 422 });
    }

    const admin = createAdminClient();

    // Verify the workflow belongs to this org
    const { data: existing } = await admin
      .from("workflows")
      .select("id")
      .eq("id", id)
      .eq("org_id", session.orgId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Workflow introuvable" }, { status: 404 });
    }

    const { data, error } = await admin
      .from("workflows")
      .update({ config: parsed.data.config, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("org_id", session.orgId)
      .select()
      .single();

    if (error) throw error;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      orgId: session.orgId,
      userId: user?.id,
      action: "workflow.updated",
      resourceType: "workflow",
      resourceId: id,
      metadata: { config: parsed.data.config },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
