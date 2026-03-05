import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const Schema = z.object({
  email:    z.string().email(),
  password: z.string().min(8).optional(),
  orgName:  z.string().min(1).max(100),
  plan:     z.enum(["free", "starter", "team", "enterprise"]).default("free"),
  status:   z.enum(["active", "inactive", "trialing"]).default("active"),
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

  // 1. Crée l'auth user (email confirmé automatiquement)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email:          parsed.data.email,
    password:       parsed.data.password ?? uuidv4().slice(0, 12) + "Aa1!",
    email_confirm:  true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const newUserId = authData.user.id;

  // 2. Crée le profil public (normalement géré par trigger, mais on force au cas où)
  await admin.from("users").upsert({
    id:    newUserId,
    email: parsed.data.email,
  });

  // 3. Génère un slug unique
  const baseSlug = parsed.data.orgName
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "org";
  const slug = `${baseSlug}-${uuidv4().slice(0, 6)}`;

  // 4. Crée l'org
  const orgId = uuidv4();
  const { error: orgError } = await admin.from("organizations").insert({
    id:                  orgId,
    name:                parsed.data.orgName,
    slug,
    plan:                parsed.data.plan,
    subscription_status: parsed.data.status,
  });

  if (orgError) {
    // Rollback auth user si org échoue
    await admin.auth.admin.deleteUser(newUserId);
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }

  // 5. Ajoute comme owner
  const { error: memberError } = await admin.from("org_members").insert({
    org_id:      orgId,
    user_id:     newUserId,
    role:        "owner",
    accepted_at: new Date().toISOString(),
  });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const url = new URL("/admin", req.url);
  url.searchParams.set("success", `Compte créé : ${parsed.data.email} (${parsed.data.plan})`);
  return NextResponse.redirect(url, { status: 303 });
}
