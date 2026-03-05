import Anthropic from "@anthropic-ai/sdk";
import { WorkflowJobData } from "@/lib/queue";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface EmailTriageInput {
  subject: string;
  from: string;
  body: string;
  receivedAt?: string;
}

export interface EmailTriageOutput {
  category: "urgent" | "info" | "spam" | "action_required";
  priority: "high" | "medium" | "low";
  summary: string;
  draft_reply: string;
  tags: string[];
}

export async function processEmailTriage(
  data: WorkflowJobData
): Promise<EmailTriageOutput> {
  const input = (data.input as unknown) as EmailTriageInput;

  const prompt = `Tu es un assistant qui aide à gérer les emails professionnels.

Analyse l'email suivant et fournis:
1. Une catégorie: urgent, info, spam, ou action_required
2. Une priorité: high, medium, low
3. Un résumé en 1-2 phrases
4. Un brouillon de réponse professionnelle en français
5. Des tags pertinents (3 max)

Email:
- De: ${input.from}
- Objet: ${input.subject}
- Reçu: ${input.receivedAt ?? "maintenant"}
- Corps:
${input.body}

Réponds UNIQUEMENT en JSON valide avec les clés: category, priority, summary, draft_reply, tags`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Parse le JSON retourné par Claude
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude n'a pas retourné de JSON valide");
  }

  const result = JSON.parse(jsonMatch[0]) as EmailTriageOutput;
  return result;
}
