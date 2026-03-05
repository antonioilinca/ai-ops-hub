import Anthropic from "@anthropic-ai/sdk";
import { WorkflowJobData } from "@/lib/queue";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface WeeklyReportInput {
  teamName?: string;
  period?: string;
  highlights?: string[];
  metrics?: Record<string, number | string>;
  challenges?: string[];
  notes?: string;
}

export interface WeeklyReportOutput {
  title: string;
  period: string;
  executive_summary: string;
  highlights: string[];
  metrics_analysis: string;
  challenges_and_risks: string[];
  recommendations: string[];
  next_week_priorities: string[];
}

export async function processWeeklyReport(
  data: WorkflowJobData
): Promise<WeeklyReportOutput> {
  const input = (data.input as unknown) as WeeklyReportInput;

  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const defaultPeriod = `${weekAgo.toLocaleDateString("fr-FR")} — ${today.toLocaleDateString("fr-FR")}`;

  const prompt = `Tu es un analyste business qui rédige des rapports hebdomadaires concis et actionnables.

Génère un rapport hebdomadaire structuré en français pour l'équipe/entreprise.

Contexte:
- Équipe: ${input.teamName ?? "Équipe"}
- Période: ${input.period ?? defaultPeriod}
- Points forts remontés: ${input.highlights?.join(", ") ?? "Non précisés"}
- Métriques clés: ${input.metrics ? JSON.stringify(input.metrics) : "Non fournies"}
- Défis identifiés: ${input.challenges?.join(", ") ?? "Non précisés"}
- Notes supplémentaires: ${input.notes ?? "Aucune"}

Génère un JSON avec exactement ces clés:
- title: titre du rapport (ex: "Rapport hebdomadaire — Équipe Marketing")
- period: période couverte
- executive_summary: résumé exécutif en 3-4 phrases
- highlights: liste de 3-5 réalisations clés (strings)
- metrics_analysis: analyse des métriques en 2-3 phrases
- challenges_and_risks: liste de 2-4 défis/risques identifiés (strings)
- recommendations: liste de 2-3 recommandations actionnables (strings)
- next_week_priorities: liste de 3-5 priorités pour la semaine suivante (strings)

Si des données manquent, génère du contenu réaliste et professionnel basé sur le contexte fourni.

Réponds UNIQUEMENT en JSON valide.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Réponse invalide de Claude");

  return JSON.parse(jsonMatch[0]) as WeeklyReportOutput;
}
