import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import IntegrationButton from "./IntegrationButton";

const INTEGRATIONS = [
  {
    provider: "gmail",
    name: "Gmail",
    desc: "Triez, répondez et automatisez vos emails entrants avec l'IA.",
    icon: "📧",
    color: "bg-red-50 border-red-100",
    iconBg: "bg-red-100",
    category: "Communication",
    comingSoon: false,
  },
  {
    provider: "slack",
    name: "Slack",
    desc: "Envoyez des résumés, alertes et rapports directement dans vos canaux.",
    icon: "💬",
    color: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-100",
    category: "Communication",
    comingSoon: false,
  },
  {
    provider: "notion",
    name: "Notion",
    desc: "Créez et enrichissez automatiquement vos pages et bases de données.",
    icon: "📝",
    color: "bg-gray-50 border-gray-200",
    iconBg: "bg-gray-100",
    category: "Productivité",
    comingSoon: false,
  },
  {
    provider: "google_drive",
    name: "Google Drive",
    desc: "Analysez, résumez et organisez vos fichiers avec l'IA.",
    icon: "📁",
    color: "bg-yellow-50 border-yellow-100",
    iconBg: "bg-yellow-100",
    category: "Productivité",
    comingSoon: false,
  },
  {
    provider: "hubspot",
    name: "HubSpot",
    desc: "Qualifiez vos leads, rédigez des suivis et mettez à jour votre CRM.",
    icon: "🎯",
    color: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100",
    category: "CRM & Ventes",
    comingSoon: false,
  },
  {
    provider: "outlook",
    name: "Outlook",
    desc: "Même puissance que Gmail pour les utilisateurs Microsoft 365.",
    icon: "📮",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
    category: "Communication",
    comingSoon: false,
  },
  {
    provider: "salesforce",
    name: "Salesforce",
    desc: "Automatisez les mises à jour de votre pipeline et la prise de notes.",
    icon: "☁️",
    color: "bg-sky-50 border-sky-100",
    iconBg: "bg-sky-100",
    category: "CRM & Ventes",
    comingSoon: true,
  },
  {
    provider: "zapier",
    name: "Zapier",
    desc: "Connectez OpsAI à 5000+ apps via des zaps intelligents.",
    icon: "⚡",
    color: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100",
    category: "Automatisation",
    comingSoon: true,
  },
  {
    provider: "teams",
    name: "Microsoft Teams",
    desc: "Notifications, résumés et rapports automatiques dans Teams.",
    icon: "🟪",
    color: "bg-violet-50 border-violet-100",
    iconBg: "bg-violet-100",
    category: "Communication",
    comingSoon: true,
  },
  {
    provider: "linear",
    name: "Linear",
    desc: "Créez des tickets, résumez les sprints et suivez la vélocité.",
    icon: "🔷",
    color: "bg-indigo-50 border-indigo-100",
    iconBg: "bg-indigo-100",
    category: "Développement",
    comingSoon: true,
  },
  {
    provider: "airtable",
    name: "Airtable",
    desc: "Enrichissez vos bases de données et automatisez vos workflows.",
    icon: "🗄️",
    color: "bg-teal-50 border-teal-100",
    iconBg: "bg-teal-100",
    category: "Productivité",
    comingSoon: true,
  },
  {
    provider: "webhook",
    name: "Webhook / API",
    desc: "Déclenchez des workflows depuis n'importe quelle source externe.",
    icon: "🔗",
    color: "bg-gray-50 border-gray-200",
    iconBg: "bg-gray-100",
    category: "Développement",
    comingSoon: false,
  },
];

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const { data: connected } = await supabase
    .from("integrations")
    .select("provider")
    .eq("org_id", member.org_id);

  const connectedProviders = new Set(connected?.map((i) => i.provider) ?? []);
  const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];

  return (
    <div className="space-y-8">
      {params.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
          {params.success} connecté avec succès !
        </div>
      )}
      {params.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
          Erreur de connexion : {params.error}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Intégrations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connectez OpsAI à vos outils pour automatiser chaque partie de votre business.
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
          {connectedProviders.size} connectée{connectedProviders.size > 1 ? "s" : ""}
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {cat}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS.filter((i) => i.category === cat).map((integration) => {
              const isConnected = connectedProviders.has(integration.provider);
              return (
                <div
                  key={integration.provider}
                  className={`relative border rounded-xl p-5 transition-all ${integration.color} ${
                    integration.comingSoon ? "opacity-60" : "hover:shadow-sm"
                  }`}
                >
                  {integration.comingSoon && (
                    <span className="absolute top-3 right-3 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      Bientôt
                    </span>
                  )}
                  {isConnected && !integration.comingSoon && (
                    <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                      Connecté
                    </span>
                  )}
                  <div className={`w-10 h-10 ${integration.iconBg} rounded-xl flex items-center justify-center text-xl mb-3`}>
                    {integration.icon}
                  </div>
                  <div className="font-semibold text-sm text-gray-900 mb-1">{integration.name}</div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{integration.desc}</p>
                  {!integration.comingSoon && (
                    <IntegrationButton provider={integration.provider} isConnected={isConnected} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
