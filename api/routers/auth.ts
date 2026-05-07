import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { OAuth2Client } from "google-auth-library";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export const authRouter = createRouter({
  googleLogin: publicQuery
    .input(z.object({ credential: z.string() }))
    .mutation(async ({ input }) => {
      const ticket = await client.verifyIdToken({
        idToken: input.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      }).catch(() => {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "رمز Google غير صالح" });
      });

      const payload = ticket.getPayload();
      if (!payload?.sub) throw new TRPCError({ code: "UNAUTHORIZED", message: "فشل التحقق" });

      const sessionToken = generateToken();
      const now = new Date();

      const existing = await getDb()
        .select()
        .from(users)
        .where(eq(users.googleId, payload.sub))
        .limit(1);

      if (existing.length > 0) {
        await getDb()
          .update(users)
          .set({ sessionToken, lastLoginAt: now })
          .where(eq(users.googleId, payload.sub));

        return {
          sessionToken,
          user: {
            id: existing[0].id,
            name: existing[0].name,
            email: existing[0].email,
            picture: existing[0].picture,
            consultationUsed: existing[0].consultationUsed,
          },
        };
      }

      const [{ id }] = await getDb()
        .insert(users)
        .values({
          googleId: payload.sub,
          name: payload.name ?? "مستخدم",
          email: payload.email ?? "",
          picture: payload.picture,
          sessionToken,
          consultationUsed: false,
        })
        .$returningId();

      return {
        sessionToken,
        user: {
          id,
          name: payload.name ?? "مستخدم",
          email: payload.email ?? "",
          picture: payload.picture ?? null,
          consultationUsed: false,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const token = ctx.req.headers.get("x-session-token");
    if (!token) return null;

    const [user] = await getDb()
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        picture: users.picture,
        consultationUsed: users.consultationUsed,
      })
      .from(users)
      .where(eq(users.sessionToken, token))
      .limit(1);

    return user ?? null;
  }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    const token = ctx.req.headers.get("x-session-token");
    if (!token) return { ok: true };

    await getDb()
      .update(users)
      .set({ sessionToken: null })
      .where(eq(users.sessionToken, token));

    return { ok: true };
  }),
});
