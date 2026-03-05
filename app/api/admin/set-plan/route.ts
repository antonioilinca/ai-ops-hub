import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const Schema = z.object({
  orgId:  z.string().uuid(),
  plan:   z.enum(["free", "starter", "team", "enterprise"]),
  status: z.enum(["active", "inactive", "trialing", "past_due", "canceled"]).optional().default("active"),
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
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("organizations")
    .update({
      plan:                 parsed.data.plan,
      subscription_status:  parsed.data.status,
      updated_at:           new Date().toISOString(),
    })
    .eq("id", parsed.data.orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const url = new URL("/admin", req.url);
  url.searchParams.set("success", `Plan mis à jour → ${parsed.data.plan} (${parsed.data.status})`);
  return NextResponse.redirect(url, { status: 303 });
}
