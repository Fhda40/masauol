import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { conversations, messages } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const conversationRouter = createRouter({
  list: publicQuery
    .input(z.object({ deviceFingerprint: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(conversations)
        .where(eq(conversations.deviceFingerprint, input.deviceFingerprint))
        .orderBy(desc(conversations.updatedAt));
    }),

  get: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [conv] = await getDb()
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.id))
        .limit(1);
      if (!conv) return null;

      const msgs = await getDb()
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.id))
        .orderBy(messages.createdAt);

      return { ...conv, messages: msgs };
    }),

  create: publicQuery
    .input(
      z.object({
        deviceFingerprint: z.string(),
        title: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const [{ id }] = await getDb()
        .insert(conversations)
        .values({
          deviceFingerprint: input.deviceFingerprint,
          title: input.title,
        })
        .$returningId();

      const [conv] = await getDb()
        .select()
        .from(conversations)
        .where(eq(conversations.id, id))
        .limit(1);

      return conv;
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        status: z.enum(["active", "archived", "converted"]).optional(),
        caseType: z
          .enum([
            "debt",
            "cybercrime",
            "drugs",
            "civil",
            "criminal",
            "labor",
            "family",
            "corporate",
            "other",
          ])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await getDb()
        .update(conversations)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(conversations.id, id));

      const [conv] = await getDb()
        .select()
        .from(conversations)
        .where(eq(conversations.id, id))
        .limit(1);

      return conv;
    }),
});
