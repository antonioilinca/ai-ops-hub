/**
 * OpsAI Worker — processeur de jobs BullMQ
 *
 * Lance avec: npm run worker
 * Ce processus tourne séparément de Next.js et exécute les tâches IA.
 */

import { Worker, Job } from "bullmq";
import { getRedisConnection, getRedisOptions, QUEUES, WorkflowJobData, EmbeddingJobData } from "@/lib/queue";
import { createAdminClient } from "@/lib/supabase/server";
import { processEmailTriage } from "./processors/email-triage";
import { processMeetingSummary } from "./processors/meeting-summary";
import { processWeeklyReport } from "./processors/weekly-report";
import { processProposalGenerator } from "./processors/proposal-generator";
import { processQaBot } from "./processors/qa-bot";
import { processLeadQualifier } from "./processors/lead-qualifier";

// Charge les variables d'env (en dev, utilise dotenv)
if (process.env.NODE_ENV !== "production") {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
}

const redis = getRedisConnection();
console.log("[worker] Démarrage OpsAI Worker...");

// ─── Worker: Workflows ───────────────────────────────────────────────────────

const workflowWorker = new Worker<WorkflowJobData>(
  QUEUES.WORKFLOWS,
  async (job: Job<WorkflowJobData>) => {
    const { runId, orgId, workflowId, type, input, config } = job.data;
    const admin = createAdminClient();

    console.log(`[worker] Job ${job.id} — type=${type} runId=${runId}`);

    // Marque le run comme "running"
    await admin
      .from("workflow_runs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", runId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let output: any;

    try {
      switch (type) {
        case "email_triage":
          output = await processEmailTriage(job.data);
          break;

        case "meeting_summary":
          output = await processMeetingSummary(job.data);
          break;

        case "weekly_report":
          output = await processWeeklyReport(job.data);
          break;

        case "proposal_generator":
          output = await processProposalGenerator(job.data);
          break;

        case "qa_bot":
          output = await processQaBot(job.data);
          break;

        case "lead_qualifier":
          output = await processLeadQualifier(job.data);
          break;

        default:
          throw new Error(`Type de workflow inconnu: ${type}`);
      }

      // Succès
      await admin
        .from("workflow_runs")
        .update({
          status:       "completed",
          output,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);

      console.log(`[worker] Job ${job.id} terminé avec succès`);
      return output;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[worker] Job ${job.id} échoué:`, errorMessage);

      // Vérifie si c'est la dernière tentative
      const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 1) - 1;

      await admin
        .from("workflow_runs")
        .update({
          status:  isLastAttempt ? "failed" : "retrying",
          error:   errorMessage,
          attempt: job.attemptsMade + 1,
        })
        .eq("id", runId);

      throw err; // BullMQ gère le retry
    }
  },
  {
    connection: getRedisOptions(),
    concurrency: 5,  // 5 jobs en parallèle max
    limiter: {
      max:      10,   // 10 jobs max
      duration: 1000, // par seconde (rate limiting API IA)
    },
  }
);

// ─── Worker: Embeddings RAG ──────────────────────────────────────────────────

const embeddingWorker = new Worker<EmbeddingJobData>(
  QUEUES.EMBEDDINGS,
  async (job: Job<EmbeddingJobData>) => {
    const { orgId, documentId, chunkId, content } = job.data;

    console.log(`[worker:embed] Chunk ${chunkId}`);

    // Génère l'embedding avec OpenAI
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
    });

    const embedding = response.data[0].embedding;

    const admin = createAdminClient();
    await admin
      .from("document_chunks")
      .update({ embedding })
      .eq("id", chunkId);

    console.log(`[worker:embed] Chunk ${chunkId} indexé`);
    return { chunkId, dimensions: embedding.length };
  },
  {
    connection: getRedisOptions(),
    concurrency: 10, // les embeddings sont rapides
  }
);

// ─── Événements BullMQ ───────────────────────────────────────────────────────

workflowWorker.on("completed", (job) => {
  console.log(`[worker] ✅ Job ${job.id} complété`);
});

workflowWorker.on("failed", (job, err) => {
  console.error(`[worker] ❌ Job ${job?.id} échoué après ${job?.attemptsMade} tentatives:`, err.message);
});

embeddingWorker.on("completed", (job) => {
  console.log(`[worker:embed] ✅ ${job.id}`);
});

// Graceful shutdown
async function shutdown() {
  console.log("[worker] Arrêt gracieux...");
  await workflowWorker.close();
  await embeddingWorker.close();
  await redis.quit();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("[worker] ✅ Workers démarrés — en attente de jobs");
console.log(`[worker]   Workflows: ${QUEUES.WORKFLOWS}`);
console.log(`[worker]   Embeddings: ${QUEUES.EMBEDDINGS}`);
