export interface WorkflowTemplate {
  id: string;
  name: string;
  icon: string;
  desc: string;
  category: string;
  tags: string[];
  time: string;
  steps: string[];
  popular?: boolean;
}

export const TEMPLATE_CATEGORIES = [
  { id: "sales", label: "Ventes & CRM", icon: "🎯", color: "bg-orange-50 border-orange-100" },
  { id: "ops", label: "Opérations", icon: "⚙️", color: "bg-blue-50 border-blue-100" },
  { id: "hr", label: "RH & Recrutement", icon: "👥", color: "bg-green-50 border-green-100" },
  { id: "marketing", label: "Marketing", icon: "📣", color: "bg-pink-50 border-pink-100" },
  { id: "finance", label: "Finance & Admin", icon: "💰", color: "bg-yellow-50 border-yellow-100" },
  { id: "support", label: "Support client", icon: "💬", color: "bg-purple-50 border-purple-100" },
];

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // ── Ventes & CRM ──
  {
    id: "lead_qualifier",
    name: "Qualification de leads",
    icon: "🎯",
    desc: "Score et qualifie automatiquement vos nouveaux leads entrants selon vos critères.",
    category: "sales",
    tags: ["Formulaire", "IA", "Scoring"],
    time: "~5 min",
    steps: ["Réception du lead via formulaire", "Analyse IA du profil", "Attribution d'un score", "Notification à l'équipe commerciale"],
    popular: true,
  },
  {
    id: "proposal_generator",
    name: "Générateur de propale",
    icon: "📄",
    desc: "Génère des propositions commerciales personnalisées depuis un brief client.",
    category: "sales",
    tags: ["IA", "Document", "PDF"],
    time: "~8 min",
    steps: ["Formulaire de brief client", "Génération IA du contenu", "Mise en page automatique", "Export PDF prêt à envoyer"],
  },
  {
    id: "follow_up_sequence",
    name: "Séquence de relance",
    icon: "📨",
    desc: "Planifie et envoie des emails de relance automatiquement après un premier contact.",
    category: "sales",
    tags: ["Email", "Automatique", "Séquence"],
    time: "~6 min",
    steps: ["Déclencheur formulaire ou import", "Email J+1 de remerciement", "Email J+3 de relance", "Alerte si pas de réponse J+7"],
  },

  // ── Opérations ──
  {
    id: "weekly_report",
    name: "Rapport hebdomadaire",
    icon: "📊",
    desc: "Compile automatiquement vos métriques et envoie un résumé chaque lundi matin.",
    category: "ops",
    tags: ["Récurrent", "IA", "Rapport"],
    time: "~5 min",
    steps: ["Collecte des données via formulaire", "Synthèse IA des métriques", "Génération du rapport", "Envoi automatique par email"],
    popular: true,
  },
  {
    id: "meeting_summary",
    name: "Compte-rendu réunion",
    icon: "🎙",
    desc: "Résumez vos réunions, identifiez les décisions et générez les tâches à faire.",
    category: "ops",
    tags: ["IA", "Notes", "Tâches"],
    time: "~3 min",
    steps: ["Saisie des notes via formulaire", "Résumé IA des points clés", "Extraction des actions", "Distribution aux participants"],
  },
  {
    id: "process_checklist",
    name: "Checklist de process",
    icon: "✅",
    desc: "Créez des checklists standardisées pour vos process récurrents (déploiement, livraison, etc.).",
    category: "ops",
    tags: ["Formulaire", "Checklist", "Suivi"],
    time: "~4 min",
    steps: ["Template de checklist", "Assignation des étapes", "Suivi de progression", "Validation finale"],
  },

  // ── RH & Recrutement ──
  {
    id: "employee_onboarding",
    name: "Onboarding employé",
    icon: "🚀",
    desc: "Guide automatisé pour intégrer un nouveau collaborateur : accès, formations, présentations.",
    category: "hr",
    tags: ["Formulaire", "Séquence", "Email"],
    time: "~10 min",
    steps: ["Formulaire d'entrée RH", "Création des accès", "Séquence d'emails de bienvenue", "Checklist formation J1-J30"],
    popular: true,
  },
  {
    id: "leave_request",
    name: "Demande de congé",
    icon: "🏖️",
    desc: "Formulaire de demande de congé avec workflow de validation manager.",
    category: "hr",
    tags: ["Formulaire", "Validation", "RH"],
    time: "~4 min",
    steps: ["Formulaire de demande", "Notification au manager", "Approbation / refus", "Mise à jour du calendrier"],
  },
  {
    id: "candidate_screening",
    name: "Pré-qualification candidat",
    icon: "🔍",
    desc: "Formulaire de candidature avec analyse IA pour trier les profils automatiquement.",
    category: "hr",
    tags: ["Formulaire", "IA", "Recrutement"],
    time: "~8 min",
    steps: ["Formulaire de candidature public", "Analyse IA du CV", "Score de compatibilité", "Notification au recruteur"],
  },

  // ── Marketing ──
  {
    id: "content_brief",
    name: "Brief de contenu",
    icon: "✍️",
    desc: "Standardisez vos briefs marketing et générez des premiers jets avec l'IA.",
    category: "marketing",
    tags: ["Formulaire", "IA", "Contenu"],
    time: "~5 min",
    steps: ["Formulaire de brief", "Génération IA du premier jet", "Review interne", "Publication"],
  },
  {
    id: "event_registration",
    name: "Inscription événement",
    icon: "🎟️",
    desc: "Formulaire d'inscription avec confirmation automatique et rappels avant l'événement.",
    category: "marketing",
    tags: ["Formulaire", "Email", "Événement"],
    time: "~6 min",
    steps: ["Formulaire d'inscription public", "Email de confirmation", "Rappel J-1", "Email de remerciement post-event"],
  },

  // ── Finance & Admin ──
  {
    id: "expense_report",
    name: "Note de frais",
    icon: "🧾",
    desc: "Soumission de notes de frais avec validation hiérarchique et suivi de remboursement.",
    category: "finance",
    tags: ["Formulaire", "Validation", "Finance"],
    time: "~5 min",
    steps: ["Formulaire de note de frais", "Validation manager", "Approbation finance", "Confirmation de remboursement"],
  },
  {
    id: "invoice_request",
    name: "Demande de facture",
    icon: "📑",
    desc: "Centralisez les demandes de facturation interne avec un workflow de création automatique.",
    category: "finance",
    tags: ["Formulaire", "Document", "Automatique"],
    time: "~4 min",
    steps: ["Formulaire de demande", "Vérification des infos", "Génération de la facture", "Envoi au client"],
  },

  // ── Support client ──
  {
    id: "ticket_support",
    name: "Ticket de support",
    icon: "🎫",
    desc: "Formulaire de ticket avec classification IA et routage automatique vers la bonne équipe.",
    category: "support",
    tags: ["Formulaire", "IA", "Routage"],
    time: "~5 min",
    steps: ["Formulaire de ticket public", "Classification IA", "Routage vers l'équipe", "Réponse automatique de confirmation"],
    popular: true,
  },
  {
    id: "qa_bot",
    name: "Base de connaissance IA",
    icon: "💬",
    desc: "Répondez aux questions de vos équipes ou clients depuis vos documents internes.",
    category: "support",
    tags: ["IA", "Documents", "Q&A"],
    time: "~10 min",
    steps: ["Import de documents", "Indexation IA", "Interface de questions", "Réponses contextuelles"],
  },
  {
    id: "feedback_collector",
    name: "Collecte de feedback",
    icon: "⭐",
    desc: "Formulaire NPS / satisfaction avec analyse automatique des tendances.",
    category: "support",
    tags: ["Formulaire", "IA", "Analyse"],
    time: "~4 min",
    steps: ["Formulaire NPS public", "Collecte des réponses", "Analyse IA des tendances", "Rapport automatique"],
  },

  // ── Bonus: Email ──
  {
    id: "email_triage",
    name: "Triage d'emails",
    icon: "📧",
    desc: "Transférez vos emails à OpsAI pour classification et réponse automatique par IA.",
    category: "ops",
    tags: ["Email entrant", "IA", "Classification"],
    time: "~5 min",
    steps: ["Forward d'email vers OpsAI", "Classification IA par priorité", "Suggestion de réponse", "Notification si urgent"],
  },
];
