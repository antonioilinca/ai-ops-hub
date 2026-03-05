import Anthropic from "@anthropic-ai/sdk";
import { WorkflowJobData } from "@/lib/queue";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface MeetingSummaryInput {
  transcript: string;
  meetingTitle?: string;
  participants?: string[];
  date?: string;
}

export interface MeetingSummaryOutput {
  title: string;
  date: string;
  participants: string[];
  summary: string;
  decisions: string[];
  action_items: Array<{
    task: string;
    assignee: string;
    deadline: string;
  }>;
  next_steps: string;
}

export async function processMeetingSummary(
  data: WorkflowJobData
): Promise<MeetingSummaryOutput> {
  const input = (data.input as unknown) as MeetingSummaryInput;

  const prompt = `Tu es un assistant expert en prise de notes de réunions.

À partir de la transcription suivante, génère un compte-rendu structuré en français.

Infos réunion:
- Titre: ${input.meetingTitle ?? "Réunion"}
- Date: ${input.date ?? new Date().toLocaleDateString("fr-FR")}
- Participants: ${input.participants?.join(", ") ?? "Non précisés"}

Transcription:
---
${input.transcript.slice(0, 8000)}
---

Génère un JSON avec:
- title: titre clair de la réunion
- date: date de la réunion
- participants: liste des participants détectés
- summary: résumé en 3-5 phrases
- decisions: liste des décisions prises (strings)
- action_items: liste d'objets {task, assignee, deadline}
- next_steps: prochaines étapes en 2-3 phrases

Réponds UNIQUEMENT en JSON valide.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Réponse invalide de Claude");

  return JSON.parse(jsonMatch[0]) as MeetingSummaryOutput;
}
