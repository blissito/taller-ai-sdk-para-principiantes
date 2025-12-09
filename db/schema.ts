import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  token: text("token").primaryKey(),
  origin: text("origin").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionToken: text("session_token")
    .notNull()
    .references(() => sessions.token, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const usageLogs = sqliteTable("usage_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionToken: text("session_token")
    .notNull()
    .references(() => sessions.token, { onDelete: "cascade" }),
  model: text("model").notNull(),
  promptTokens: integer("prompt_tokens").notNull(),
  completionTokens: integer("completion_tokens").notNull(),
  totalTokens: integer("total_tokens").notNull(),
  costUsd: integer("cost_usd"), // En microdólares (1 USD = 1,000,000)
  latencyMs: integer("latency_ms").notNull(),
  finishReason: text("finish_reason"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Tools/Herramientas configurables por el host
export const tools = sqliteTable("tools", {
  id: text("id").primaryKey(),
  name: text("name").unique().notNull(), // "bookCourt" (identifier para AI)
  title: text("title").notNull(), // "Reservar Cancha" (human-readable)
  description: text("description").notNull(), // Para el LLM
  inputSchemaJson: text("input_schema_json").notNull(), // JSON Schema
  outputSchemaJson: text("output_schema_json"), // Opcional

  // Webhook config
  endpointUrl: text("endpoint_url").notNull(),
  httpMethod: text("http_method").notNull().default("POST"),
  headersJson: text("headers_json"), // { "Authorization": "Bearer xxx" }
  timeoutMs: integer("timeout_ms").notNull().default(10000),

  // UX
  requiresConfirmation: integer("requires_confirmation", { mode: "boolean" })
    .notNull()
    .default(false),
  navigationUrl: text("navigation_url"), // "/reservas/{{bookingId}}"

  // Estado
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Logs de ejecución de tools
export const toolExecutions = sqliteTable("tool_executions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  toolId: text("tool_id").references(() => tools.id),
  sessionToken: text("session_token"),
  inputJson: text("input_json"),
  outputJson: text("output_json"),
  status: text("status", { enum: ["success", "error", "timeout"] }).notNull(),
  errorMessage: text("error_message"),
  latencyMs: integer("latency_ms"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type UsageLog = typeof usageLogs.$inferSelect;
export type NewUsageLog = typeof usageLogs.$inferInsert;
export type Tool = typeof tools.$inferSelect;
export type NewTool = typeof tools.$inferInsert;
export type ToolExecution = typeof toolExecutions.$inferSelect;
export type NewToolExecution = typeof toolExecutions.$inferInsert;
