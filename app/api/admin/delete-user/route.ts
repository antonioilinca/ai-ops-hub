import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const Schema = z.object({
  userId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json().catch(async () => {
    const fd = await req.formData();
    return Object.fromEntries(fd.entries());
  });

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 });
  }

  const targetUserId = parsed.data.userId;

  // Block self-deletion
  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Get user email for flash message
  const { data: targetUser } = await admin.auth.admin.getUserById(targetUserId);
  const targetEmail = targetUser?.user?.email ?? "inconnu";

  // 2. Get orgs where user is the sole owner → delete those orgs
  const { data: memberships } = await admin
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", targetUserId);

  const ownedOrgIds = (memberships ?? [])
    .filter(m => m.role === "owner")
    .map(m => m.org_id);

  for (const orgId of ownedOrgIds) {
    // Check if there are other owners
    const { count } = await admin
      .from("org_members")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("role", "owner")
      .neq("user_id", targetUserId);

    if (count === 0) {
      // Sole owner — delete all org members, then the org
      await admin.from("org_members").delete().eq("org_id", orgId);
      await admin.from("workflows").delete().eq("org_id", orgId);
      await admin.from("workflow_runs").delete().eq("org_id", orgId);
      await admin.from("integrations").delete().eq("org_id", orgId);
      await admin.from("course_completions").delete().eq("org_id", orgId);
      await admin.from("audit_logs").delete().eq("org_id", orgId);
      await admin.from("organizations").delete().eq("id", orgId);
    }
  }

  // 3. Remove remaining memberships
  await admin.from("org_members").delete().eq("user_id", targetUserId);

  // 4. Remove from public.users
  await admin.from("users").delete().eq("id", targetUserId);

  // 5. Delete auth user
  const { error: authError } = await admin.auth.admin.deleteUser(targetUserId);

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // 6. Log the action
  await admin.from("audit_logs").insert({
    user_id: user.id,
    action: "admin.delete_user",
    resource_type: "user",
    metadata: { deleted_email: targetEmail, deleted_user_id: targetUserId },
  });

  const url = new URL("/admin", req.url);
  url.searchParams.set("success", `Compte supprimé : ${targetEmail}`);
  return NextResponse.redirect(url, { status: 303 });
}
