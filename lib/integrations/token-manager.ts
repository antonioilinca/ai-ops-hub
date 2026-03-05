import { createAdminClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/encryption";
import { OAUTH_PROVIDERS, ProviderSlug } from "./providers";

/**
 * Récupère un access_token valide pour une intégration.
 * Rafraîchit automatiquement si expiré et qu'un refresh_token existe.
 */
export async function getAccessToken(
  orgId: string,
  provider: ProviderSlug
): Promise<string | null> {
  const admin = createAdminClient();

  const { data: integration } = await admin
    .from("integrations")
    .select("access_token_enc, refresh_token_enc, token_expires_at")
    .eq("org_id", orgId)
    .eq("provider", provider)
    .single();

  if (!integration?.access_token_enc) return null;

  // Vérifier si le token est encore valide (avec 5 min de marge)
  const expiresAt = integration.token_expires_at
    ? new Date(integration.token_expires_at).getTime()
    : Infinity;

  const isExpired = expiresAt < Date.now() + 5 * 60 * 1000;

  if (!isExpired) {
    return decrypt(integration.access_token_enc);
  }

  // Token expiré — tenter un refresh
  if (!integration.refresh_token_enc) {
    // Pas de refresh token, l'intégration doit être reconnectée
    return null;
  }

  const refreshToken = decrypt(integration.refresh_token_enc);
  const config = OAUTH_PROVIDERS[provider];
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!clientId || !clientSecret) return null;

  try {
    const resp = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await resp.json();
    if (!data.access_token) return null;

    // Mettre à jour les tokens en base
    const newAccessEnc = encrypt(data.access_token);
    const newRefreshEnc = data.refresh_token
      ? encrypt(data.refresh_token)
      : integration.refresh_token_enc;
    const newExpires = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null;

    await admin
      .from("integrations")
      .update({
        access_token_enc: newAccessEnc,
        refresh_token_enc: newRefreshEnc,
        token_expires_at: newExpires,
        updated_at: new Date().toISOString(),
      })
      .eq("org_id", orgId)
      .eq("provider", provider);

    return data.access_token;
  } catch (err) {
    console.error(`Token refresh failed for ${provider}:`, err);
    return null;
  }
}
