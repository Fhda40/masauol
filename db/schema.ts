import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  json,
  bigint,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

export const conversations = mysqlTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    deviceFingerprint: varchar("device_fingerprint", { length: 64 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    caseType: mysqlEnum("case_type", [
      "debt",
      "cybercrime",
      "drugs",
      "civil",
      "criminal",
      "labor",
      "family",
      "corporate",
      "other",
    ]),
    status: mysqlEnum("status", ["active", "archived", "converted"])
      .notNull()
      .default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    deviceIdx: index("device_idx").on(table.deviceFingerprint),
    statusIdx: index("status_idx").on(table.status),
  })
);

export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: bigint("conversation_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  analysis: json("analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = mysqlTable("leads", {
  id: serial("id").primaryKey(),
  conversationId: bigint("conversation_id", {
    mode: "number",
    unsigned: true,
  }),
  caseType: varchar("case_type", { length: 50 }).notNull(),
  issueSummary: text("issue_summary").notNull(),
  riskLevel: mysqlEnum("risk_level", ["low", "medium", "high", "critical"])
    .notNull()
    .default("medium"),
  urgencyLevel: mysqlEnum("urgency_level", ["low", "medium", "high", "urgent"])
    .notNull()
    .default("medium"),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "closed"])
    .notNull()
    .default("new"),
  contactName: varchar("contact_name", { length: 100 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const legalChunks = mysqlTable(
  "legal_chunks",
  {
    id: serial("id").primaryKey(),
    lawName: varchar("law_name", { length: 100 }).notNull(),
    chapter: varchar("chapter", { length: 200 }).notNull(),
    articleNumber: varchar("article_number", { length: 50 }).notNull(),
    articleText: text("article_text").notNull(),
    tags: json("tags").$type<string[]>().notNull().default([]),
    category: varchar("category", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("category_idx").on(table.category),
    lawIdx: index("law_idx").on(table.lawName),
  })
);

export type LegalChunk = typeof legalChunks.$inferSelect;
export type InsertLegalChunk = typeof legalChunks.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
