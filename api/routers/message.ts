import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { messages, conversations } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export const messageRouter = createRouter({
  list: publicQuery
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(asc(messages.createdAt));
    }),

  create: publicQuery
    .input(
      z.object({
        conversationId: z.number(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
        analysis: z.record(z.string(), z.any()).nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [{ id }] = await getDb()
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          role: input.role,
          content: input.content,
          analysis: input.analysis ?? null,
        })
        .$returningId();

      await getDb()
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      const [msg] = await getDb()
        .select()
        .from(messages)
        .where(eq(messages.id, id))
        .limit(1);

      return msg;
    }),
});
