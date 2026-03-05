import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { OAUTH_PROVIDERS, getCallbackUrl, isValidProvider } from "@/lib/integrations/providers";
import { encrypt } from "@/lib/encryption";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * GET /api/integrations/[provider]/callback
 * OAuth callback — échange le code contre des tokens, les stocke chiffrés.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (!isValidProvider(provider)) {
    return NextResponse.redirect(`${APP_URL}/integrations?error=provider_inconnu`);
  }

  const code = req.nextUrl.searchParams.get("code");
  const stateParam = req.nextUrl.searchParams.get("state");
  const errorParam = req.nextUrl.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(`${APP_URL}/integrations?error=${encodeURIComponent(errorParam)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/integrations?error=code_manquant`);
  }

  // Vérifier le state anti-CSRF
  const stateCookie = req.cookies.get("oauth_state")?.value;
  if (!stateCookie) {
    return NextResponse.redirect(`${APP_URL}/integrations?error=state_expire`);
  }

  let stateData: { state: string; orgId: string; provider: string };
  try {
    stateData = JSON.parse(stateCookie);
  } catch {
    return NextResponse.redirect(`${APP_URL}/integrations?error=state_invalide`);
  }

  if (stateData.state !== stateParam || stateData.provider !== provider) {
    return NextResponse.redirect(`${APP_URL}/integrations?error=state_mismatch`);
  }

  // Vérifier l'utilisateur
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login`);
  }

  // Échanger le code contre des tokens
  const config = OAUTH_PROVIDERS[provider];
  const clientId = process.env[config.clientIdEnv]!;
  const clientSecret = process.env[config.clientSecretEnv]!;
  const callbackUrl = getCallbackUrl(provider);

  let tokenData: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    [key: string]: unknown;
  };

  try {
    if (provider === "notion") {
      // Notion utilise Basic Auth
      const resp = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: callbackUrl,
        }),
      });
      tokenData = await resp.json();
    } else if (provider === "slack") {
      // Slack utilise form-urlencoded
      const resp = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: callbackUrl,
        }),
      });
      const json = await resp.json();
      if (!json.ok) throw new Error(json.error ?? "Slack OAuth failed");
      tokenData = {
        access_token: json.access_token ?? json.authed_user?.access_token,
        refresh_token: json.refresh_token,
        team_id: json.team?.id,
        team_name: json.team?.name,
      };
    } else {
      // Standard OAuth2 (Google, HubSpot, Microsoft)
      const resp = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: callbackUrl,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      tokenData = await resp.json();
    }

    if (!tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.redirect(`${APP_URL}/integrations?error=token_exchange_failed`);
    }
  } catch (err) {
    console.error("OAuth token exchange error:", err);
    return NextResponse.redirect(`${APP_URL}/integrations?error=token_exchange_error`);
  }

  // Chiffrer les tokens
  const accessTokenEnc = encrypt(tokenData.access_token);
  const refreshTokenEnc = tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null;
  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  // Extraire config supplémentaire selon le provider
  const extraConfig: Record<string, unknown> = {};
  if (provider === "slack") {
    extraConfig.team_id = tokenData.team_id;
    extraConfig.team_name = tokenData.team_name;
  }
  if (provider === "notion") {
    extraConfig.workspace_id = tokenData.workspace_id;
    extraConfig.workspace_name = tokenData.workspace_name;
  }

  // Upsert dans la base (UNIQUE sur org_id + provider)
  const admin = createAdminClient();
  const { error: dbError } = await admin
    .from("integrations")
    .upsert(
      {
        org_id: stateData.orgId,
        provider,
        access_token_enc: accessTokenEnc,
        refresh_token_enc: refreshTokenEnc,
        token_expires_at: expiresAt,
        config: extraConfig,
        connected_by: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "org_id,provider" }
    );

  if (dbError) {
    console.error("DB upsert error:", dbError);
    return NextResponse.redirect(`${APP_URL}/integrations?error=db_error`);
  }

  // Supprimer le cookie state
  const response = NextResponse.redirect(`${APP_URL}/integrations?success=${provider}`);
  response.cookies.delete("oauth_state");
  return response;
}
