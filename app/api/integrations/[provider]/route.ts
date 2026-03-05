import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isValidProvider } from "@/lib/integrations/providers";
import { logAudit, getRequestMeta } from "@/lib/audit";

/**
 * DELETE /api/integrations/[provider]
 * Déconnecte une intégration (supprime les tokens).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: "Provider inconnu" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !["owner", "admin"].includes(member.role)) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("integrations")
    .delete()
    .eq("org_id", member.org_id)
    .eq("provider", provider);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log d'audit
  const { ipAddress, userAgent } = getRequestMeta(req);
  await logAudit({
    orgId: member.org_id,
    userId: user.id,
    action: "integration.disconnected",
    resourceType: "integration",
    resourceId: provider,
    metadata: { provider },
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ success: true });
}
