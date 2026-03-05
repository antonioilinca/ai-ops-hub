import { Queue, Worker, Job, QueueOptions } from "bullmq";
import IORedis, { RedisOptions } from "ioredis";

// ─── Connection Redis partagée ────────────────────────────────────────────────

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null, // requis par BullMQ
    });
  }
  return redisConnection;
}

export function getRedisOptions(): RedisOptions {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password || undefined,
    maxRetriesPerRequest: null,
  };
}

// ─── Noms des queues ──────────────────────────────────────────────────────────

export const QUEUES = {
  WORKFLOWS: "workflows",
  EMAILS: "emails",
  EMBEDDINGS: "embeddings",
} as const;

// ─── Types de jobs ────────────────────────────────────────────────────────────

export interface WorkflowJobData {
  runId: string;
  orgId: string;
  workflowId: string;
  type: string;
  input: Record<string, unknown>;
  config: Record<string, unknown>;
}

export interface EmbeddingJobData {
  orgId: string;
  documentId: string;
  chunkId: string;
  content: string;
}

// ─── Factory de queues ────────────────────────────────────────────────────────

const queueOptions: QueueOptions = {
  connection: getRedisOptions(),
  defaultJobOptions: {
    attempts: 3,           // 3 tentatives max
    backoff: {
      type: "exponential",
      delay: 2000,         // 2s → 4s → 8s
    },
    removeOnComplete: { count: 100 }, // garde les 100 derniers jobs réussis
    removeOnFail: { count: 500 },     // garde les 500 derniers échoués
  },
};

// Singleton par nom de queue
const queues = new Map<string, Queue>();

export function getQueue(name: string): Queue {
  if (!queues.has(name)) {
    queues.set(name, new Queue(name, queueOptions));
  }
  return queues.get(name)!;
}

// ─── Helper: envoyer un job workflow ─────────────────────────────────────────

export async function enqueueWorkflowRun(
  data: WorkflowJobData,
  idempotencyKey?: string
): Promise<Job> {
  const queue = getQueue(QUEUES.WORKFLOWS);

  return queue.add("run", data, {
    jobId: idempotencyKey, // BullMQ déduplique si même jobId
    priority: 1,
  });
}

// ─── Helper: envoyer un job embedding ────────────────────────────────────────

export async function enqueueEmbedding(data: EmbeddingJobData): Promise<Job> {
  const queue = getQueue(QUEUES.EMBEDDINGS);
  return queue.add("embed", data, {
    jobId: `embed:${data.chunkId}`,
  });
}
