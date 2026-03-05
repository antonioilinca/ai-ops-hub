/**
 * Configuration centralisée des providers OAuth.
 * Chaque provider a ses URLs, scopes, et la façon d'échanger un code contre un token.
 */

export type ProviderSlug = "gmail" | "slack" | "notion" | "google_drive" | "hubspot" | "outlook";

export interface OAuthProviderConfig {
  slug: ProviderSlug;
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  /** Env var names for client id and secret */
  clientIdEnv: string;
  clientSecretEnv: string;
  /** Some providers need extra params on authorize */
  extraAuthorizeParams?: Record<string, string>;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const OAUTH_PROVIDERS: Record<ProviderSlug, OAuthProviderConfig> = {
  gmail: {
    slug: "gmail",
    name: "Gmail",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
    ],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    extraAuthorizeParams: {
      access_type: "offline",
      prompt: "consent",
    },
  },
  google_drive: {
    slug: "google_drive",
    name: "Google Drive",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
    ],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    extraAuthorizeParams: {
      access_type: "offline",
      prompt: "consent",
    },
  },
  slack: {
    slug: "slack",
    name: "Slack",
    authorizeUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    scopes: [
      "chat:write",
      "channels:read",
      "channels:history",
      "users:read",
    ],
    clientIdEnv: "SLACK_CLIENT_ID",
    clientSecretEnv: "SLACK_CLIENT_SECRET",
  },
  notion: {
    slug: "notion",
    name: "Notion",
    authorizeUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    scopes: [],
    clientIdEnv: "NOTION_CLIENT_ID",
    clientSecretEnv: "NOTION_CLIENT_SECRET",
    extraAuthorizeParams: {
      owner: "user",
    },
  },
  hubspot: {
    slug: "hubspot",
    name: "HubSpot",
    authorizeUrl: "https://app.hubspot.com/oauth/authorize",
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
    scopes: [
      "crm.objects.contacts.read",
      "crm.objects.contacts.write",
      "crm.objects.deals.read",
    ],
    clientIdEnv: "HUBSPOT_CLIENT_ID",
    clientSecretEnv: "HUBSPOT_CLIENT_SECRET",
  },
  outlook: {
    slug: "outlook",
    name: "Outlook",
    authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: [
      "Mail.Read",
      "Mail.Send",
      "offline_access",
    ],
    clientIdEnv: "MICROSOFT_CLIENT_ID",
    clientSecretEnv: "MICROSOFT_CLIENT_SECRET",
  },
};

export function getCallbackUrl(provider: ProviderSlug): string {
  return `${APP_URL}/api/integrations/${provider}/callback`;
}

export function isValidProvider(slug: string): slug is ProviderSlug {
  return slug in OAUTH_PROVIDERS;
}
