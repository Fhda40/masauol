import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { leads, conversations } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const leadRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        conversationId: z.number().optional(),
        caseType: z.string(),
        issueSummary: z.string(),
        riskLevel: z.enum(["low", "medium", "high", "critical"]),
        urgencyLevel: z.enum(["low", "medium", "high", "urgent"]),
        contactName: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [{ id }] = await getDb()
        .insert(leads)
        .values({
          conversationId: input.conversationId ?? null,
          caseType: input.caseType,
          issueSummary: input.issueSummary,
          riskLevel: input.riskLevel,
          urgencyLevel: input.urgencyLevel,
          contactName: input.contactName ?? null,
          contactPhone: input.contactPhone ?? null,
          contactEmail: input.contactEmail ?? null,
        })
        .$returningId();

      // Update conversation status to converted if conversation exists
      if (input.conversationId) {
        await getDb()
          .update(conversations)
          .set({ status: "converted", updatedAt: new Date() })
          .where(eq(conversations.id, input.conversationId));
      }

      const [lead] = await getDb()
        .select()
        .from(leads)
        .where(eq(leads.id, id))
        .limit(1);

      return lead;
    }),

  list: publicQuery.query(async () => {
    return getDb()
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt));
  }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "qualified", "closed"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await getDb()
        .update(leads)
        .set(updates)
        .where(eq(leads.id, id));

      const [lead] = await getDb()
        .select()
        .from(leads)
        .where(eq(leads.id, id))
        .limit(1);

      return lead;
    }),
});
