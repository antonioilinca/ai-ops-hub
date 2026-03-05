import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OAUTH_PROVIDERS, getCallbackUrl, isValidProvider } from "@/lib/integrations/providers";
import { randomBytes } from "crypto";

/**
 * GET /api/integrations/[provider]/authorize
 * Redirige l'utilisateur vers la page d'autorisation OAuth du provider.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: "Provider inconnu" }, { status: 400 });
  }

  // Vérifier que l'utilisateur est connecté et a une org
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Seuls owner et admin peuvent connecter des intégrations
  if (!["owner", "admin"].includes(member.role)) {
    return NextResponse.json({ error: "Seuls les admins peuvent connecter des intégrations" }, { status: 403 });
  }

  const config = OAUTH_PROVIDERS[provider];
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];
  if (!clientId || !clientSecret) {
    // Rediriger avec erreur lisible au lieu de retourner du JSON brut
    const msg = encodeURIComponent(`${config.name} n'est pas encore configuré. Contactez l'administrateur.`);
    return NextResponse.redirect(new URL(`/integrations?error=${msg}`, req.url));
  }

  // Générer un state token pour protéger contre CSRF
  const state = randomBytes(32).toString("hex");

  // Stocker le state dans un cookie httpOnly (expire dans 10 min)
  const statePayload = JSON.stringify({ state, orgId: member.org_id, provider });

  const callbackUrl = getCallbackUrl(provider);
  const params2 = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    state,
    ...(config.scopes.length > 0 && {
      scope: config.scopes.join(provider === "slack" ? "," : " "),
    }),
    ...config.extraAuthorizeParams,
  });

  const authorizeUrl = `${config.authorizeUrl}?${params2.toString()}`;

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("oauth_state", statePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
