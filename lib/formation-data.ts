export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "lecture" | "exercise";
}

export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  duration: string;
  lessonsCount: number;
  plan: "free" | "starter" | "team";
  category: string;
  tags: string[];
  description: string;
  outcomes: string[];
  lessons: Lesson[];
  color: string;
  bgColor: string;
}

export const COURSES: Course[] = [
  {
    slug: "ia-entreprise-guide-debutant",
    title: "L'IA en entreprise : Guide du débutant",
    subtitle: "Comprendre et démarrer votre transformation IA",
    icon: "🚀",
    level: "Débutant",
    duration: "1h30",
    lessonsCount: 6,
    plan: "free",
    category: "Fondamentaux",
    tags: ["IA", "Stratégie", "Business"],
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-100",
    description: "Ce cours vous donne toutes les bases pour comprendre l'IA et identifier les opportunités d'automatisation dans votre entreprise. Pas besoin d'être technique — 100% orienté business.",
    outcomes: [
      "Comprendre les concepts clés de l'IA sans jargon technique",
      "Identifier les 5 zones d'automatisation à fort ROI dans votre business",
      "Construire votre feuille de route IA en 30 minutes",
      "Éviter les erreurs classiques des premières implémentations",
      "Convaincre votre direction et vos équipes",
    ],
    lessons: [
      { id: "1-1", title: "L'IA en 2025 : ce qui a vraiment changé", duration: "12 min", type: "lecture" },
      { id: "1-2", title: "Les 4 types d'automatisation IA", duration: "15 min", type: "lecture" },
      { id: "1-3", title: "Identifier vos quick wins (< 1 semaine)", duration: "18 min", type: "exercise" },
      { id: "1-4", title: "Les erreurs qui coûtent cher — et comment les éviter", duration: "14 min", type: "lecture" },
      { id: "1-5", title: "Construire votre roadmap IA", duration: "20 min", type: "exercise" },
      { id: "1-6", title: "Pitcher l'IA en interne (template inclus)", duration: "11 min", type: "exercise" },
    ],
  },
  {
    slug: "automatiser-emails-ia",
    title: "Automatiser ses emails avec l'IA",
    subtitle: "Récupérez 2h par jour sur votre boîte mail",
    icon: "📧",
    level: "Débutant",
    duration: "1h45",
    lessonsCount: 7,
    plan: "free",
    category: "Automatisation",
    tags: ["Gmail", "Outlook", "Emails", "Productivité"],
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-100",
    description: "Votre boîte mail vous dévore ? Ce cours vous apprend à classifier, prioriser et répondre automatiquement à vos emails grâce à l'IA. Compatible Gmail et Outlook.",
    outcomes: [
      "Mettre en place un triage automatique par priorité",
      "Créer des réponses types intelligentes pour 80% de vos emails",
      "Déléguer les emails de support à un agent IA",
      "Réduire le volume d'emails traités manuellement de 70%",
      "Configurer votre workflow email_triage dans OpsAI",
    ],
    lessons: [
      { id: "2-1", title: "Anatomie d'une boîte mail efficace", duration: "10 min", type: "lecture" },
      { id: "2-2", title: "Comment l'IA lit et comprend vos emails", duration: "14 min", type: "lecture" },
      { id: "2-3", title: "Configurer le triage IA (Gmail)", duration: "20 min", type: "video" },
      { id: "2-4", title: "Configurer le triage IA (Outlook)", duration: "18 min", type: "video" },
      { id: "2-5", title: "Créer vos templates de réponse IA", duration: "22 min", type: "exercise" },
      { id: "2-6", title: "Gérer les cas complexes et escalades", duration: "12 min", type: "lecture" },
      { id: "2-7", title: "Mesurer votre gain de temps", duration: "9 min", type: "exercise" },
    ],
  },
  {
    slug: "premier-workflow-ia",
    title: "Créer son premier workflow IA",
    subtitle: "De zéro à votre première automatisation en 45 min",
    icon: "⚡",
    level: "Débutant",
    duration: "2h",
    lessonsCount: 8,
    plan: "starter",
    category: "Automatisation",
    tags: ["Workflows", "OpsAI", "No-code"],
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100",
    description: "Formation pratique pas à pas pour créer votre première automatisation IA avec OpsAI. À la fin du cours, vous avez un workflow en production qui tourne tout seul.",
    outcomes: [
      "Maîtriser l'interface OpsAI en moins d'une heure",
      "Choisir le bon template selon votre besoin",
      "Configurer, tester et déployer un workflow complet",
      "Connecter vos outils existants (Gmail, Slack, Notion...)",
      "Lire et interpréter les logs d'exécution",
    ],
    lessons: [
      { id: "3-1", title: "Tour d'horizon de l'interface OpsAI", duration: "10 min", type: "video" },
      { id: "3-2", title: "Choisir son premier template", duration: "12 min", type: "lecture" },
      { id: "3-3", title: "Connecter ses outils (intégrations)", duration: "20 min", type: "video" },
      { id: "3-4", title: "Configurer le workflow étape par étape", duration: "25 min", type: "exercise" },
      { id: "3-5", title: "Tester en conditions réelles", duration: "15 min", type: "exercise" },
      { id: "3-6", title: "Mettre en production et activer", duration: "10 min", type: "video" },
      { id: "3-7", title: "Surveiller et optimiser", duration: "14 min", type: "lecture" },
      { id: "3-8", title: "Passer au workflow suivant", duration: "14 min", type: "exercise" },
    ],
  },
  {
    slug: "ia-crm-ventes",
    title: "Intégrer l'IA dans son CRM et ses ventes",
    subtitle: "Boostez votre pipeline avec des leads qualifiés par IA",
    icon: "🎯",
    level: "Intermédiaire",
    duration: "2h30",
    lessonsCount: 9,
    plan: "team",
    category: "Ventes & CRM",
    tags: ["HubSpot", "Salesforce", "Leads", "IA"],
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-100",
    description: "Apprenez à utiliser l'IA pour qualifier vos leads, personnaliser vos relances et mettre à jour votre CRM automatiquement. Compatible HubSpot et Salesforce.",
    outcomes: [
      "Scorer vos leads automatiquement avec l'IA",
      "Personnaliser chaque séquence de vente à grande échelle",
      "Réduire le temps de saisie CRM de 80%",
      "Détecter les opportunités chaudes en temps réel",
      "Former votre équipe commerciale à travailler avec l'IA",
    ],
    lessons: [
      { id: "4-1", title: "Les données CRM comme carburant de l'IA", duration: "15 min", type: "lecture" },
      { id: "4-2", title: "Qualifier automatiquement les leads entrants", duration: "20 min", type: "video" },
      { id: "4-3", title: "Rédiger des emails de vente avec l'IA", duration: "18 min", type: "exercise" },
      { id: "4-4", title: "Mise à jour automatique des deals HubSpot", duration: "22 min", type: "video" },
      { id: "4-5", title: "Scorer et prioriser votre pipeline", duration: "20 min", type: "exercise" },
      { id: "4-6", title: "Détection des signaux d'achat", duration: "15 min", type: "lecture" },
      { id: "4-7", title: "Reporting commercial IA-powered", duration: "18 min", type: "exercise" },
      { id: "4-8", title: "Gérer les objections avec l'aide de l'IA", duration: "16 min", type: "lecture" },
      { id: "4-9", title: "Déploiement et formation de votre équipe", duration: "16 min", type: "exercise" },
    ],
  },
  {
    slug: "rapports-automatiques",
    title: "Générer des rapports automatiques",
    subtitle: "Vos rapports écrits pendant que vous dormez",
    icon: "📊",
    level: "Intermédiaire",
    duration: "2h15",
    lessonsCount: 8,
    plan: "team",
    category: "Reporting",
    tags: ["Données", "Rapports", "Analytics", "IA"],
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-100",
    description: "Créez des rapports hebdomadaires, mensuels et trimestriels qui se génèrent tout seuls, avec des données à jour et une présentation professionnelle.",
    outcomes: [
      "Automatiser vos rapports hebdomadaires en moins de 2h de setup",
      "Connecter vos sources de données (GA, CRM, finance)",
      "Générer des narratifs IA autour de vos chiffres",
      "Distribuer automatiquement aux bons destinataires",
      "Créer des dashboards IA actualisés en temps réel",
    ],
    lessons: [
      { id: "5-1", title: "Anatomie d'un bon rapport business", duration: "12 min", type: "lecture" },
      { id: "5-2", title: "Connecter vos sources de données", duration: "20 min", type: "video" },
      { id: "5-3", title: "Configurer le workflow weekly_report", duration: "22 min", type: "exercise" },
      { id: "5-4", title: "Écrire les templates narratifs IA", duration: "18 min", type: "exercise" },
      { id: "5-5", title: "Intégrer Google Analytics et CRM", duration: "20 min", type: "video" },
      { id: "5-6", title: "Programmer l'envoi automatique", duration: "10 min", type: "video" },
      { id: "5-7", title: "Rapports trimestriels et annuels", duration: "20 min", type: "lecture" },
      { id: "5-8", title: "Valider la qualité avec un processus de review", duration: "13 min", type: "exercise" },
    ],
  },
  {
    slug: "roi-transformation-ia",
    title: "Mesurer le ROI de votre transformation IA",
    subtitle: "Prouver la valeur de l'IA en chiffres",
    icon: "💰",
    level: "Avancé",
    duration: "1h45",
    lessonsCount: 6,
    plan: "team",
    category: "Stratégie",
    tags: ["ROI", "KPIs", "Direction", "Finance"],
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-100",
    description: "Comment démontrer à votre direction et vos investisseurs que l'IA génère un retour concret. Framework de mesure, templates de présentation et benchmarks sectoriels.",
    outcomes: [
      "Calculer précisément le temps économisé par workflow",
      "Convertir les gains de productivité en euros",
      "Présenter le ROI à votre CODIR en 10 slides",
      "Définir les bons KPIs pour votre secteur",
      "Construire un business case pour augmenter votre budget IA",
    ],
    lessons: [
      { id: "6-1", title: "Pourquoi mesurer ? Les enjeux business", duration: "12 min", type: "lecture" },
      { id: "6-2", title: "Les 8 KPIs IA à suivre absolument", duration: "18 min", type: "lecture" },
      { id: "6-3", title: "Calculer le temps économisé (formule)", duration: "20 min", type: "exercise" },
      { id: "6-4", title: "Modèle de présentation CODIR (template)", duration: "22 min", type: "exercise" },
      { id: "6-5", title: "Benchmarks par secteur", duration: "15 min", type: "lecture" },
      { id: "6-6", title: "Construire son business case IA", duration: "18 min", type: "exercise" },
    ],
  },
];

export const PLAN_ORDER: Record<string, number> = { free: 0, starter: 1, team: 2, enterprise: 3 };

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getCoursesByPlan(plan: string): Course[] {
  const order = { free: 0, starter: 1, team: 2, enterprise: 3 };
  const planLevel = order[plan as keyof typeof order] ?? 0;
  return COURSES.filter((c) => order[c.plan] <= planLevel);
}
