import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const Schema = z.object({
  orgName: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Nom invalide" }, { status: 422 });
    }

    const admin = createAdminClient();

    // Vérifie si l'user a déjà une org
    const { data: existing } = await admin
      .from("org_members")
      .select("id")
      .eq("user_id", user.id)
      .not("accepted_at", "is", null)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Organisation déjà existante" }, { status: 409 });
    }

    // Génère un slug unique
    const baseSlug = parsed.data.orgName
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "org";
    const slug = `${baseSlug}-${uuidv4().slice(0, 6)}`;

    // Crée l'org
    const orgId = uuidv4();
    const { error: orgError } = await admin
      .from("organizations")
      .insert({
        id: orgId,
        name: parsed.data.orgName,
        slug,
        plan: "free",
        subscription_status: "active",
      });

    if (orgError) throw orgError;

    // Ajoute l'user comme owner
    const { error: memberError } = await admin
      .from("org_members")
      .insert({
        org_id: orgId,
        user_id: user.id,
        role: "owner",
        accepted_at: new Date().toISOString(),
      });

    if (memberError) throw memberError;

    return NextResponse.json({ data: { orgId }, error: null }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
