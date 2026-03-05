import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const Schema = z.object({
  userId: z.string().uuid(),
  orgId:  z.string().uuid(),
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

  const admin = createAdminClient();

  // Supprime le membership (pas l'auth.user — réversible)
  const { error } = await admin
    .from("org_members")
    .delete()
    .eq("user_id", parsed.data.userId)
    .eq("org_id", parsed.data.orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const url = new URL("/admin", req.url);
  url.searchParams.set("success", "Accès révoqué");
  return NextResponse.redirect(url, { status: 303 });
}
