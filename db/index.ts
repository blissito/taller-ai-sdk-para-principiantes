import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, lt, gt } from "drizzle-orm";
import * as schema from "./schema.js";

const DB_PATH = process.env.DATABASE_URL || "./data/chat.db";

// Crear directorio data si no existe
import { mkdirSync } from "fs";
import { dirname } from "path";
try {
  mkdirSync(dirname(DB_PATH), { recursive: true });
} catch {}

const sqlite = new Database(DB_PATH);
// WAL = Write-Ahead Logging. Mejora rendimiento de escritura y permite
// lecturas concurrentes mientras se escribe. Ideal para aplicaciones web.
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// ============ Session Operations ============

export function createSession(
  token: string,
  origin: string,
  expiresMs: number
) {
  return db
    .insert(schema.sessions)
    .values({
      token,
      origin,
      expires: new Date(expiresMs),
    })
    .run();
}

export function getSession(token: string) {
  const results = db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.token, token))
    .all();
  return results[0] || null;
}

export function deleteSession(token: string) {
  return db
    .delete(schema.sessions)
    .where(eq(schema.sessions.token, token))
    .run();
}

export function deleteExpiredSessions() {
  return db
    .delete(schema.sessions)
    .where(lt(schema.sessions.expires, new Date()))
    .run();
}

export function getAllSessions() {
  return db.select().from(schema.sessions).all();
}

export function getActiveSessions() {
  return db
    .select()
    .from(schema.sessions)
    .where(gt(schema.sessions.expires, new Date()))
    .all();
}

// ============ Chat Message Operations ============

export function saveChatMessage(
  sessionToken: string,
  role: "user" | "assistant" | "system",
  content: string
) {
  return db
    .insert(schema.chatMessages)
    .values({
      sessionToken,
      role,
      content,
    })
    .run();
}

export function getChatHistory(sessionToken: string) {
  return db
    .select()
    .from(schema.chatMessages)
    .where(eq(schema.chatMessages.sessionToken, sessionToken))
    .orderBy(schema.chatMessages.createdAt)
    .all();
}

export function saveChatMessages(
  sessionToken: string,
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
) {
  if (messages.length === 0) return;
  return db
    .insert(schema.chatMessages)
    .values(messages.map((m) => ({ sessionToken, role: m.role, content: m.content })))
    .run();
}

// ============ Statistics ============

export function getMessageStats() {
  const result = sqlite
    .prepare(
      `
    SELECT
      COUNT(*) as totalMessages,
      COUNT(DISTINCT session_token) as totalSessions,
      SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as userMessages,
      SUM(CASE WHEN role = 'assistant' THEN 1 ELSE 0 END) as assistantMessages
    FROM chat_messages
  `
    )
    .get() as {
    totalMessages: number;
    totalSessions: number;
    userMessages: number;
    assistantMessages: number;
  };
  return result;
}

export function getMessagesByDay(days = 7) {
  const result = sqlite
    .prepare(
      `
    SELECT
      date(created_at / 1000, 'unixepoch') as day,
      COUNT(*) as count,
      COUNT(DISTINCT session_token) as sessions
    FROM chat_messages
    WHERE created_at > ?
    GROUP BY day
    ORDER BY day DESC
  `
    )
    .all(Date.now() - days * 24 * 60 * 60 * 1000) as Array<{
    day: string;
    count: number;
    sessions: number;
  }>;
  return result;
}

export function getMessagesByOrigin() {
  const result = sqlite
    .prepare(
      `
    SELECT
      s.origin,
      COUNT(m.id) as messageCount,
      COUNT(DISTINCT m.session_token) as sessionCount
    FROM chat_messages m
    JOIN sessions s ON m.session_token = s.token
    GROUP BY s.origin
    ORDER BY messageCount DESC
  `
    )
    .all() as Array<{
    origin: string;
    messageCount: number;
    sessionCount: number;
  }>;
  return result;
}

// ============ Usage Logs Operations ============

// Precios en microdólares por 1M tokens (dic 2024)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini-2024-07-18": { input: 150_000, output: 600_000 }, // $0.15/$0.60 per 1M
  "gpt-4.1-mini": { input: 400_000, output: 1_600_000 }, // $0.40/$1.60 per 1M
  "gpt-4o": { input: 2_500_000, output: 10_000_000 }, // $2.50/$10 per 1M
  "gpt-4o-2024-11-20": { input: 2_500_000, output: 10_000_000 },
};

function calculateCostMicro(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["gpt-4o-mini-2024-07-18"];
  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  return Math.round(inputCost + outputCost);
}

export function saveUsageLog(data: {
  sessionToken: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  finishReason?: string;
}) {
  const costUsd = calculateCostMicro(
    data.model,
    data.promptTokens,
    data.completionTokens
  );
  return db
    .insert(schema.usageLogs)
    .values({
      sessionToken: data.sessionToken,
      model: data.model,
      promptTokens: data.promptTokens,
      completionTokens: data.completionTokens,
      totalTokens: data.totalTokens,
      costUsd,
      latencyMs: data.latencyMs,
      finishReason: data.finishReason,
    })
    .run();
}

export function getUsageStats() {
  const result = sqlite
    .prepare(
      `
    SELECT
      COUNT(*) as totalRequests,
      SUM(prompt_tokens) as totalPromptTokens,
      SUM(completion_tokens) as totalCompletionTokens,
      SUM(total_tokens) as totalTokens,
      SUM(cost_usd) as totalCostMicro,
      AVG(latency_ms) as avgLatencyMs
    FROM usage_logs
  `
    )
    .get() as {
    totalRequests: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    totalCostMicro: number;
    avgLatencyMs: number;
  };
  return result;
}

export function getUsageByDay(days = 7) {
  const result = sqlite
    .prepare(
      `
    SELECT
      date(created_at / 1000, 'unixepoch') as day,
      COUNT(*) as requests,
      SUM(total_tokens) as tokens,
      SUM(cost_usd) as costMicro,
      AVG(latency_ms) as avgLatency
    FROM usage_logs
    WHERE created_at > ?
    GROUP BY day
    ORDER BY day DESC
  `
    )
    .all(Date.now() - days * 24 * 60 * 60 * 1000) as Array<{
    day: string;
    requests: number;
    tokens: number;
    costMicro: number;
    avgLatency: number;
  }>;
  return result;
}

export function getUsageByOrigin() {
  const result = sqlite
    .prepare(
      `
    SELECT
      s.origin,
      COUNT(u.id) as requests,
      SUM(u.total_tokens) as tokens,
      SUM(u.cost_usd) as costMicro
    FROM usage_logs u
    JOIN sessions s ON u.session_token = s.token
    GROUP BY s.origin
    ORDER BY costMicro DESC
  `
    )
    .all() as Array<{
    origin: string;
    requests: number;
    tokens: number;
    costMicro: number;
  }>;
  return result;
}

// ============ Config Operations ============

export function getConfig(key: string): string | null {
  const result = sqlite
    .prepare(`SELECT value FROM config WHERE key = ?`)
    .get(key) as { value: string } | undefined;
  return result?.value ?? null;
}

export function setConfig(key: string, value: string) {
  return sqlite
    .prepare(`INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, ?)`)
    .run(key, value, Date.now());
}

export function getAllConfig(): Record<string, string> {
  const rows = sqlite
    .prepare(`SELECT key, value FROM config`)
    .all() as Array<{ key: string; value: string }>;
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function isPublicAccess(): boolean {
  return getConfig("public_access") === "true";
}

export function getAllowedOriginsFromDb(): string[] {
  const value = getConfig("allowed_origins");
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

// ============ Init ============

export function initDb() {
  // Crear tablas si no existen (push automático)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      origin TEXT NOT NULL,
      expires INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT NOT NULL REFERENCES sessions(token) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT NOT NULL REFERENCES sessions(token) ON DELETE CASCADE,
      model TEXT NOT NULL,
      prompt_tokens INTEGER NOT NULL,
      completion_tokens INTEGER NOT NULL,
      total_tokens INTEGER NOT NULL,
      cost_usd INTEGER,
      latency_ms INTEGER NOT NULL,
      finish_reason TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_token);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_session ON usage_logs(session_token);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
  `);

  // Inicializar configuración por defecto
  const defaults: Record<string, string> = {
    public_access: "false",
    allowed_origins: "",
  };

  for (const [key, value] of Object.entries(defaults)) {
    sqlite.prepare(`INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`).run(key, value);
  }

  console.log("[DB] SQLite initialized at", DB_PATH);
}
