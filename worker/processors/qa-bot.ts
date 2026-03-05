import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { WorkflowJobData } from "@/lib/queue";
import { createAdminClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface QaBotInput {
  question: string;
  /** Optional: restrict search to specific document IDs */
  documentIds?: string[];
  /** Optional: max number of chunks to retrieve */
  topK?: number;
}

export interface QaBotOutput {
  answer: string;
  confidence: "high" | "medium" | "low";
  sources: Array<{
    documentId: string;
    chunkContent: string;
    similarity: number;
  }>;
  follow_up_questions: string[];
}

/**
 * RAG pipeline: embed question → search pgvector → generate answer with Claude
 */
export async function processQaBot(
  data: WorkflowJobData
): Promise<QaBotOutput> {
  const input = (data.input as unknown) as QaBotInput;
  const orgId = data.orgId;
  const topK = input.topK ?? 5;

  // 1. Embed the question using OpenAI
  const embeddingResp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: input.question,
  });
  const queryEmbedding = embeddingResp.data[0].embedding;

  // 2. Search for relevant chunks via pgvector
  const admin = createAdminClient();
  const { data: chunks, error } = await admin.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_count: topK,
    match_org_id: orgId,
  });

  if (error) {
    console.error("match_chunks error:", error);
  }

  const relevantChunks = (chunks ?? []) as Array<{
    id: string;
    document_id: string;
    content: string;
    similarity: number;
  }>;

  // 3. Build context from retrieved chunks
  const context = relevantChunks.length > 0
    ? relevantChunks
        .map((c, i) => `[Source ${i + 1}] (pertinence: ${(c.similarity * 100).toFixed(0)}%)\n${c.content}`)
        .join("\n\n---\n\n")
    : "Aucun document pertinent trouvé dans la base de connaissances.";

  // 4. Generate answer with Claude
  const prompt = `Tu es un assistant IA qui répond aux questions en se basant sur la base de connaissances de l'entreprise.

RÈGLES IMPORTANTES:
- Réponds UNIQUEMENT à partir des documents fournis ci-dessous
- Si l'information n'est pas dans les documents, dis-le clairement
- Cite les sources quand tu les utilises
- Sois précis et concis

DOCUMENTS TROUVÉS:
${context}

QUESTION: ${input.question}

Réponds en JSON avec ces clés:
- answer: ta réponse détaillée en français (2-5 phrases)
- confidence: "high" si les documents couvrent bien le sujet, "medium" si partiellement, "low" si peu pertinent
- follow_up_questions: liste de 2-3 questions de suivi pertinentes (strings)

Réponds UNIQUEMENT en JSON valide.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Réponse invalide de Claude");

  const result = JSON.parse(jsonMatch[0]) as {
    answer: string;
    confidence: "high" | "medium" | "low";
    follow_up_questions: string[];
  };

  return {
    answer: result.answer,
    confidence: result.confidence,
    sources: relevantChunks.map((c) => ({
      documentId: c.document_id,
      chunkContent: c.content.slice(0, 200),
      similarity: c.similarity,
    })),
    follow_up_questions: result.follow_up_questions,
  };
}
