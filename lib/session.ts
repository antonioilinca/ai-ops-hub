// Helper pour récupérer le contexte de session (userId + orgId + role + plan)
// dans les API Routes Next.js

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SessionContext } from "@/types";

export async function getSessionContext(
  request?: Request
): Promise<SessionContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Récupère le premier org_member actif de l'utilisateur
  // En production, l'org active serait stockée en cookie/session
  const admin = createAdminClient();
  const { data: member } = await admin
    .from("org_members")
    .select("org_id, role, organizations(plan)")
    .eq("user_id", user.id)
    .not("accepted_at", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!member) return null;

  const org = (member.organizations as unknown) as { plan: string } | null;

  return {
    userId: user.id,
    orgId:  member.org_id,
    role:   member.role as SessionContext["role"],
    plan:   (org?.plan ?? "free") as SessionContext["plan"],
  };
}

// Version qui throw si non authentifié (pour les routes protégées)
export async function requireSession(request?: Request): Promise<SessionContext> {
  const ctx = await getSessionContext(request);
  if (!ctx) {
    throw new Error("Non authentifié");
  }
  return ctx;
}
