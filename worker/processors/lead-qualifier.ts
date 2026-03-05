import Anthropic from "@anthropic-ai/sdk";
import { WorkflowJobData } from "@/lib/queue";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface LeadQualifierInput {
  leadName: string;
  company?: string;
  email?: string;
  source?: string;
  message?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  /** Custom qualification criteria */
  criteria?: string[];
}

export interface LeadQualifierOutput {
  lead_name: string;
  company: string;
  score: number; // 0-100
  qualification: "hot" | "warm" | "cold" | "disqualified";
  summary: string;
  strengths: string[];
  concerns: string[];
  recommended_action: string;
  suggested_response: string;
  icp_fit: "strong" | "moderate" | "weak";
}

export async function processLeadQualifier(
  data: WorkflowJobData
): Promise<LeadQualifierOutput> {
  const input = (data.input as unknown) as LeadQualifierInput;
  const config = data.config as Record<string, unknown>;

  const criteriaText = input.criteria?.length
    ? input.criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")
    : config.qualification_criteria
    ? String(config.qualification_criteria)
    : "Budget suffisant, besoin réel identifié, décideur identifié, timeline défini";

  const prompt = `Tu es un expert en qualification de leads B2B.

Analyse le lead suivant et qualifie-le selon les critères définis.

INFORMATIONS SUR LE LEAD:
- Nom: ${input.leadName}
- Entreprise: ${input.company ?? "Non renseigné"}
- Email: ${input.email ?? "Non renseigné"}
- Source: ${input.source ?? "Non renseigné"}
- Industrie: ${input.industry ?? "Non renseigné"}
- Taille entreprise: ${input.companySize ?? "Non renseigné"}
- Site web: ${input.website ?? "Non renseigné"}
- Message/Demande: ${input.message ?? "Aucun message"}

CRITÈRES DE QUALIFICATION:
${criteriaText}

Génère un JSON avec ces clés:
- lead_name: nom du lead
- company: entreprise du lead
- score: score de 0 à 100 (entier)
- qualification: "hot" (80-100, prêt à acheter), "warm" (50-79, intéressé), "cold" (20-49, à nurture), "disqualified" (0-19, ne correspond pas)
- summary: résumé de l'analyse en 2-3 phrases
- strengths: liste de 2-4 points forts du lead (strings)
- concerns: liste de 1-3 points de vigilance (strings)
- recommended_action: action recommandée concrète (1-2 phrases)
- suggested_response: brouillon de réponse personnalisée au lead (3-5 phrases)
- icp_fit: "strong" si correspond au profil client idéal, "moderate" si partiel, "weak" si faible

Sois réaliste et pragmatique dans ton évaluation.
Réponds UNIQUEMENT en JSON valide.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Réponse invalide de Claude");

  return JSON.parse(jsonMatch[0]) as LeadQualifierOutput;
}
