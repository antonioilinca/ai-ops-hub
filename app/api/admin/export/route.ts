import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? "users";
  const admin = createAdminClient();

  if (type === "orgs") {
    const { data: orgs } = await admin
      .from("organizations")
      .select("id, name, slug, plan, subscription_status, stripe_customer_id, stripe_subscription_id, created_at, updated_at")
      .order("created_at", { ascending: false });

    const headers = ["id", "name", "slug", "plan", "subscription_status", "stripe_customer_id", "stripe_subscription_id", "created_at", "updated_at"];
    const rows = (orgs ?? []).map(o => headers.map(h => escapeCSV((o as any)[h])));
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    // Log export
    await admin.from("audit_logs").insert({
      user_id: user.id,
      action: "admin.export",
      resource_type: "organizations",
      metadata: { count: orgs?.length ?? 0 },
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="opsai-organizations-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  // Default: users export
  const { data: members } = await admin
    .from("org_members")
    .select(`
      role, accepted_at, created_at,
      org_id,
      user_id,
      users ( id, email, full_name, created_at )
    `)
    .order("created_at", { ascending: false });

  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name, plan, subscription_status");

  const orgMap: Record<string, any> = {};
  (orgs ?? []).forEach(o => (orgMap[o.id] = o));

  const headers = ["user_id", "email", "full_name", "org_name", "org_plan", "org_status", "role", "accepted_at", "created_at"];
  const rows = (members ?? []).map(m => {
    const u = (m as any).users;
    const org = orgMap[m.org_id];
    return [
      m.user_id,
      u?.email ?? "",
      u?.full_name ?? "",
      org?.name ?? "",
      org?.plan ?? "",
      org?.subscription_status ?? "",
      m.role,
      m.accepted_at ?? "",
      m.created_at,
    ].map(escapeCSV);
  });

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  await admin.from("audit_logs").insert({
    user_id: user.id,
    action: "admin.export",
    resource_type: "users",
    metadata: { count: members?.length ?? 0 },
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="opsai-users-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

function escapeCSV(value: any): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
