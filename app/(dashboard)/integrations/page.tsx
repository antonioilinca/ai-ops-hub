import { redirect } from "next/navigation";

/**
 * L'ancienne page Intégrations redirige vers Templates.
 * Les intégrations tierces (Gmail, Slack, etc.) ont été remplacées
 * par des templates de workflows natifs + formulaires.
 */
export default function IntegrationsPage() {
  redirect("/templates");
}
