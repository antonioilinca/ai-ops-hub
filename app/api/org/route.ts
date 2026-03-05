import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { z } from "zod";

// POST /api/org — crée une organisation (onboarding)
const CreateOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug: lettres minuscules, chiffres et tirets uniquement"),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateOrgSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const admin = createAdminClient();

    // Vérifie que le slug n'est pas pris
    const { data: existing } = await admin
      .from("organizations")
      .select("id")
      .eq("slug", parsed.data.slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Ce slug est déjà pris" }, { status: 409 });
    }

    // Crée l'org
    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({ name: parsed.data.name, slug: parsed.data.slug })
      .select()
      .single();

    if (orgError) throw orgError;

    // Crée le member owner
    const { error: memberError } = await admin.from("org_members").insert({
      org_id:      org.id,
      user_id:     user.id,
      role:        "owner",
      accepted_at: new Date().toISOString(),
    });

    if (memberError) throw memberError;

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      orgId:        org.id,
      userId:       user.id,
      action:       "org.created",
      resourceType: "organization",
      resourceId:   org.id,
      metadata:     { name: org.name, slug: org.slug },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ data: org, error: null }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
