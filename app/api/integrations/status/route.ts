import { NextResponse } from "next/server";
import { OAUTH_PROVIDERS, type ProviderSlug } from "@/lib/integrations/providers";

/**
 * GET /api/integrations/status
 * Retourne la liste des providers et s'ils sont configurés (env vars présentes).
 * Pas de données sensibles — juste configured: true/false.
 */
export async function GET() {
  const status: Record<string, boolean> = {};

  for (const [slug, config] of Object.entries(OAUTH_PROVIDERS)) {
    const hasClientId = !!process.env[config.clientIdEnv];
    const hasClientSecret = !!process.env[config.clientSecretEnv];
    status[slug] = hasClientId && hasClientSecret;
  }

  // Webhook est toujours "configuré" (pas d'OAuth)
  status["webhook"] = true;

  return NextResponse.json(status);
}
