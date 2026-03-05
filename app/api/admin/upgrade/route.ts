import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // 1. Vérifier que l'utilisateur est super_admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // 2. Parser les données du formulaire
  const formData = await request.formData();
  const orgId = formData.get("orgId") as string;
  const plan  = (formData.get("plan") as string) || "team";

  if (!orgId) {
    return NextResponse.json({ error: "orgId requis" }, { status: 400 });
  }

  // Plans valides pour l'upgrade
  const validPlans = ["starter", "team", "enterprise"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  // 3. Mettre à jour avec le client admin (bypass RLS)
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("organizations")
    .update({
      plan,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orgId);

  if (error) {
    console.error("Erreur upgrade org:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }

  // 4. Rediriger vers /admin avec un message de succès
  const url = new URL("/admin", request.url);
  url.searchParams.set("success", `Plan mis à jour vers ${plan}`);
  return NextResponse.redirect(url, { status: 303 });
}
