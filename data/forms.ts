export interface FormField {
  id: string;
  type: "text" | "email" | "textarea" | "select" | "number" | "date" | "file" | "checkbox" | "phone" | "url";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // pour select
}

export interface FormTemplate {
  id: string;
  name: string;
  icon: string;
  desc: string;
  category: string;
  fields: FormField[];
  popular?: boolean;
}

export const FORM_CATEGORIES = [
  { id: "contact", label: "Contact & Leads", icon: "📬" },
  { id: "hr", label: "RH & Recrutement", icon: "👥" },
  { id: "feedback", label: "Feedback & Support", icon: "⭐" },
  { id: "operations", label: "Opérations", icon: "⚙️" },
  { id: "finance", label: "Finance", icon: "💰" },
];

export const FORM_TEMPLATES: FormTemplate[] = [
  // ── Contact & Leads ──
  {
    id: "contact_form",
    name: "Formulaire de contact",
    icon: "📬",
    desc: "Recevez les demandes de vos prospects et clients directement dans OpsAI.",
    category: "contact",
    popular: true,
    fields: [
      { id: "name", type: "text", label: "Nom complet", placeholder: "Jean Dupont", required: true },
      { id: "email", type: "email", label: "Email", placeholder: "jean@exemple.fr", required: true },
      { id: "phone", type: "phone", label: "Téléphone", placeholder: "+33 6 12 34 56 78" },
      { id: "company", type: "text", label: "Entreprise", placeholder: "Nom de l'entreprise" },
      { id: "subject", type: "select", label: "Sujet", required: true, options: ["Demande d'info", "Devis", "Partenariat", "Autre"] },
      { id: "message", type: "textarea", label: "Message", placeholder: "Décrivez votre besoin...", required: true },
    ],
  },
  {
    id: "lead_capture",
    name: "Capture de lead",
    icon: "🎯",
    desc: "Formulaire court pour qualifier rapidement vos prospects entrants.",
    category: "contact",
    popular: true,
    fields: [
      { id: "name", type: "text", label: "Nom", placeholder: "Prénom Nom", required: true },
      { id: "email", type: "email", label: "Email pro", placeholder: "email@entreprise.com", required: true },
      { id: "company", type: "text", label: "Entreprise", required: true },
      { id: "size", type: "select", label: "Taille de l'équipe", options: ["1-5", "6-20", "21-50", "51-200", "200+"] },
      { id: "budget", type: "select", label: "Budget estimé", options: ["< 1k€", "1k-5k€", "5k-20k€", "20k€+"] },
      { id: "need", type: "textarea", label: "Besoin principal", placeholder: "Quel problème souhaitez-vous résoudre ?" },
    ],
  },
  {
    id: "demo_request",
    name: "Demande de démo",
    icon: "🎬",
    desc: "Permettez à vos prospects de réserver une démo en quelques clics.",
    category: "contact",
    fields: [
      { id: "name", type: "text", label: "Nom complet", required: true },
      { id: "email", type: "email", label: "Email pro", required: true },
      { id: "company", type: "text", label: "Entreprise", required: true },
      { id: "role", type: "text", label: "Poste occupé", placeholder: "Ex: Directeur Commercial" },
      { id: "date", type: "date", label: "Date souhaitée" },
      { id: "context", type: "textarea", label: "Contexte", placeholder: "Que souhaitez-vous voir lors de la démo ?" },
    ],
  },

  // ── RH & Recrutement ──
  {
    id: "job_application",
    name: "Candidature spontanée",
    icon: "📋",
    desc: "Centralisez les candidatures avec CV et lettre de motivation.",
    category: "hr",
    popular: true,
    fields: [
      { id: "name", type: "text", label: "Nom complet", required: true },
      { id: "email", type: "email", label: "Email", required: true },
      { id: "phone", type: "phone", label: "Téléphone", required: true },
      { id: "position", type: "select", label: "Poste visé", required: true, options: ["Développeur", "Commercial", "Marketing", "Support", "Ops", "Autre"] },
      { id: "experience", type: "select", label: "Expérience", options: ["Junior (0-2 ans)", "Confirmé (3-5 ans)", "Senior (5+ ans)"] },
      { id: "cv", type: "file", label: "CV (PDF)", required: true },
      { id: "motivation", type: "textarea", label: "Motivation", placeholder: "Pourquoi souhaitez-vous nous rejoindre ?" },
    ],
  },
  {
    id: "leave_request_form",
    name: "Demande de congé",
    icon: "🏖️",
    desc: "Formulaire standardisé pour les demandes de congé avec validation.",
    category: "hr",
    fields: [
      { id: "name", type: "text", label: "Nom de l'employé", required: true },
      { id: "email", type: "email", label: "Email", required: true },
      { id: "type", type: "select", label: "Type de congé", required: true, options: ["Congé payé", "RTT", "Maladie", "Sans solde", "Autre"] },
      { id: "start", type: "date", label: "Date de début", required: true },
      { id: "end", type: "date", label: "Date de fin", required: true },
      { id: "notes", type: "textarea", label: "Commentaire", placeholder: "Précisions éventuelles..." },
    ],
  },
  {
    id: "onboarding_form",
    name: "Fiche d'onboarding",
    icon: "🚀",
    desc: "Collectez les infos d'un nouveau collaborateur pour préparer son arrivée.",
    category: "hr",
    fields: [
      { id: "name", type: "text", label: "Nom complet", required: true },
      { id: "email", type: "email", label: "Email personnel", required: true },
      { id: "start_date", type: "date", label: "Date d'arrivée", required: true },
      { id: "department", type: "select", label: "Département", required: true, options: ["Tech", "Commercial", "Marketing", "Support", "RH", "Finance"] },
      { id: "manager", type: "text", label: "Manager direct" },
      { id: "needs", type: "textarea", label: "Besoins spécifiques", placeholder: "Matériel, accès, logiciels..." },
    ],
  },

  // ── Feedback & Support ──
  {
    id: "nps_survey",
    name: "Enquête NPS",
    icon: "⭐",
    desc: "Mesurez la satisfaction de vos clients avec un NPS automatisé.",
    category: "feedback",
    popular: true,
    fields: [
      { id: "email", type: "email", label: "Email", required: true },
      { id: "score", type: "number", label: "De 0 à 10, recommanderiez-vous OpsAI ?", required: true },
      { id: "reason", type: "textarea", label: "Pourquoi cette note ?", placeholder: "Expliquez votre choix..." },
      { id: "improve", type: "textarea", label: "Que pourrions-nous améliorer ?" },
    ],
  },
  {
    id: "support_ticket",
    name: "Ticket de support",
    icon: "🎫",
    desc: "Formulaire de ticket structuré avec classification automatique.",
    category: "feedback",
    fields: [
      { id: "name", type: "text", label: "Nom", required: true },
      { id: "email", type: "email", label: "Email", required: true },
      { id: "category", type: "select", label: "Catégorie", required: true, options: ["Bug", "Question", "Demande de fonctionnalité", "Facturation", "Autre"] },
      { id: "priority", type: "select", label: "Priorité", options: ["Basse", "Moyenne", "Haute", "Urgente"] },
      { id: "description", type: "textarea", label: "Description", placeholder: "Décrivez votre problème en détail...", required: true },
      { id: "screenshot", type: "file", label: "Capture d'écran (optionnel)" },
    ],
  },
  {
    id: "event_feedback",
    name: "Feedback événement",
    icon: "🎤",
    desc: "Collectez les retours après un événement, webinar ou formation.",
    category: "feedback",
    fields: [
      { id: "name", type: "text", label: "Nom" },
      { id: "email", type: "email", label: "Email" },
      { id: "rating", type: "select", label: "Note globale", required: true, options: ["⭐ Excellent", "👍 Bien", "😐 Moyen", "👎 Décevant"] },
      { id: "best", type: "textarea", label: "Ce que vous avez le plus aimé" },
      { id: "improve", type: "textarea", label: "Ce qui pourrait être amélioré" },
      { id: "recommend", type: "checkbox", label: "Je recommande cet événement" },
    ],
  },

  // ── Opérations ──
  {
    id: "meeting_notes",
    name: "Notes de réunion",
    icon: "🎙️",
    desc: "Structurez vos comptes-rendus : participants, décisions, actions.",
    category: "operations",
    fields: [
      { id: "title", type: "text", label: "Titre de la réunion", required: true },
      { id: "date", type: "date", label: "Date", required: true },
      { id: "participants", type: "textarea", label: "Participants", placeholder: "Un par ligne" },
      { id: "summary", type: "textarea", label: "Résumé des discussions", required: true },
      { id: "decisions", type: "textarea", label: "Décisions prises" },
      { id: "actions", type: "textarea", label: "Actions à mener", placeholder: "Action — Responsable — Deadline" },
    ],
  },
  {
    id: "incident_report",
    name: "Rapport d'incident",
    icon: "🚨",
    desc: "Documentez les incidents avec un formulaire standardisé.",
    category: "operations",
    fields: [
      { id: "reporter", type: "text", label: "Signalé par", required: true },
      { id: "date", type: "date", label: "Date de l'incident", required: true },
      { id: "severity", type: "select", label: "Sévérité", required: true, options: ["Mineure", "Modérée", "Majeure", "Critique"] },
      { id: "description", type: "textarea", label: "Description de l'incident", required: true },
      { id: "impact", type: "textarea", label: "Impact business" },
      { id: "resolution", type: "textarea", label: "Résolution / Actions correctives" },
    ],
  },

  // ── Finance ──
  {
    id: "expense_form",
    name: "Note de frais",
    icon: "🧾",
    desc: "Soumission de notes de frais avec justificatifs.",
    category: "finance",
    fields: [
      { id: "name", type: "text", label: "Nom de l'employé", required: true },
      { id: "date", type: "date", label: "Date de la dépense", required: true },
      { id: "category", type: "select", label: "Catégorie", required: true, options: ["Transport", "Repas", "Hébergement", "Fournitures", "Autre"] },
      { id: "amount", type: "number", label: "Montant (€)", required: true },
      { id: "description", type: "text", label: "Description", required: true },
      { id: "receipt", type: "file", label: "Justificatif (PDF/image)", required: true },
    ],
  },
  {
    id: "invoice_request_form",
    name: "Demande de facture",
    icon: "📑",
    desc: "Centralisez les demandes de facturation interne.",
    category: "finance",
    fields: [
      { id: "requester", type: "text", label: "Demandeur", required: true },
      { id: "client_name", type: "text", label: "Nom du client", required: true },
      { id: "client_email", type: "email", label: "Email du client", required: true },
      { id: "amount", type: "number", label: "Montant HT (€)", required: true },
      { id: "description", type: "textarea", label: "Détail de la prestation", required: true },
      { id: "due_date", type: "date", label: "Date d'échéance" },
    ],
  },
];
