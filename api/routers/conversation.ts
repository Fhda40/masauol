import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { conversations, messages, users } from "@db/schema";
import { eq, desc, count, or } from "drizzle-orm";

async function getUserFromToken(token: string | null) {
  if (!token) return null;
  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.sessionToken, token))
    .limit(1);
  return user ?? null;
}

export const conversationRouter = createRouter({
  list: publicQuery
    .input(z.object({ deviceFingerprint: z.string() }))
    .query(async ({ input, ctx }) => {
      const token = ctx.req.headers.get("x-session-token");
      const user = await getUserFromToken(token);

      if (user) {
        return getDb()
          .select()
          .from(conversations)
          .where(eq(conversations.userId, user.id))
          .orderBy(desc(conversations.updatedAt));
      }

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
    .mutation(async ({ input, ctx }) => {
      const token = ctx.req.headers.get("x-session-token");
      const user = await getUserFromToken(token);

      if (user) {
        // Logged-in: check by userId
        if (user.consultationUsed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "لقد استخدمت استشارتك المجانية. للحصول على استشارة كاملة، تواصل مع فريق مسؤول للمحاماة.",
          });
        }

        const [{ id }] = await getDb()
          .insert(conversations)
          .values({
            userId: user.id,
            deviceFingerprint: input.deviceFingerprint,
            title: input.title,
          })
          .$returningId();

        // Mark consultation as used
        await getDb()
          .update(users)
          .set({ consultationUsed: true })
          .where(eq(users.id, user.id));

        const [conv] = await getDb()
          .select()
          .from(conversations)
          .where(eq(conversations.id, id))
          .limit(1);

        return conv;
      }

      // Guest: require login
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "يرجى تسجيل الدخول بحساب Google للحصول على استشارتك المجانية.",
      });
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
