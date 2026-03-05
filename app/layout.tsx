import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ai-ops-hub-eight.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "OpsAI — Automatisez votre opérationnel avec l'IA",
    template: "%s | OpsAI",
  },
  description:
    "Connectez vos outils (Gmail, Slack, Notion, HubSpot…) et automatisez vos tâches répétitives grâce à l'IA. Workflows sans code, formation intégrée, résultats mesurables.",
  keywords: [
    "automatisation IA",
    "workflow automation",
    "OpsAI",
    "no-code",
    "productivité",
    "IA entreprise",
    "automatisation emails",
    "CRM IA",
    "SaaS B2B",
  ],
  authors: [{ name: "OpsAI" }],
  creator: "OpsAI",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: APP_URL,
    siteName: "OpsAI",
    title: "OpsAI — Automatisez votre opérationnel avec l'IA",
    description:
      "Workflows sans code, IA intégrée, 12 intégrations natives. Automatisez Gmail, Slack, Notion, HubSpot et plus.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpsAI — Automatisez votre opérationnel avec l'IA",
    description:
      "Workflows sans code, IA intégrée, 12 intégrations natives. Automatisez Gmail, Slack, Notion, HubSpot et plus.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  alternates: { canonical: APP_URL },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
