import Anthropic from "@anthropic-ai/sdk";
import { WorkflowJobData } from "@/lib/queue";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ProposalInput {
  clientName: string;
  projectTitle?: string;
  projectDescription: string;
  budget?: string;
  timeline?: string;
  companyName?: string;
  additionalContext?: string;
}

export interface ProposalOutput {
  title: string;
  client: string;
  date: string;
  executive_summary: string;
  problem_statement: string;
  proposed_solution: string;
  deliverables: Array<{ item: string; description: string }>;
  timeline: Array<{ phase: string; duration: string; description: string }>;
  investment: string;
  why_us: string;
  next_steps: string;
}

export async function processProposalGenerator(
  data: WorkflowJobData
): Promise<ProposalOutput> {
  const input = (data.input as unknown) as ProposalInput;

  const prompt = `Tu es un expert en rédaction de propositions commerciales B2B en français.

Génère une proposition commerciale complète et professionnelle.

Informations:
- Client: ${input.clientName}
- Projet: ${input.projectTitle ?? "Projet"}
- Description du besoin: ${input.projectDescription}
- Budget indicatif: ${input.budget ?? "À définir"}
- Délai souhaité: ${input.timeline ?? "À définir"}
- Notre entreprise: ${input.companyName ?? "Notre entreprise"}
- Contexte additionnel: ${input.additionalContext ?? "Aucun"}

Génère un JSON avec ces clés:
- title: titre de la proposition
- client: nom du client
- date: date du jour au format "5 mars 2026"
- executive_summary: résumé exécutif en 3-4 phrases convaincantes
- problem_statement: description du problème/besoin du client en 2-3 phrases
- proposed_solution: description détaillée de la solution proposée (4-5 phrases)
- deliverables: liste de 3-6 objets {item, description} — les livrables concrets
- timeline: liste de 2-4 objets {phase, duration, description} — les phases du projet
- investment: paragraphe sur l'investissement/budget (2-3 phrases)
- why_us: pourquoi nous choisir (3-4 phrases différenciantes)
- next_steps: prochaines étapes pour avancer (2-3 phrases)

Le ton doit être professionnel, confiant mais pas arrogant.
Réponds UNIQUEMENT en JSON valide.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Réponse invalide de Claude");

  return JSON.parse(jsonMatch[0]) as ProposalOutput;
}
