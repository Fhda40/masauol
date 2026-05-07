import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { createRouter, publicQuery } from "../middleware";
import { env } from "../lib/env";

// Hash the admin password once at startup
const ADMIN_HASH = bcrypt.hashSync(env.adminPassword, 12);

// Active sessions: token → expiry timestamp
const sessions = new Map<string, number>();

// Brute force tracker: ip → { attempts, lockedUntil }
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function validateAdminSession(token: string | null): boolean {
  if (!token) return false;
  const expiry = sessions.get(token);
  if (!expiry || Date.now() > expiry) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export const adminRouter = createRouter({
  login: publicQuery
    .input(z.object({ password: z.string().max(200) }))
    .mutation(({ input, ctx }) => {
      const ip = getClientIp(ctx.req);
      const attempt = loginAttempts.get(ip);

      if (attempt && Date.now() < attempt.lockedUntil) {
        const minsLeft = Math.ceil((attempt.lockedUntil - Date.now()) / 60_000);
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `محاولات كثيرة — حاول بعد ${minsLeft} دقيقة`,
        });
      }

      const valid = bcrypt.compareSync(input.password, ADMIN_HASH);

      if (!valid) {
        const current = attempt ?? { count: 0, lockedUntil: 0 };
        current.count++;
        if (current.count >= MAX_ATTEMPTS) {
          current.lockedUntil = Date.now() + LOCKOUT_MS;
          current.count = 0;
        }
        loginAttempts.set(ip, current);
        const remaining = MAX_ATTEMPTS - (current.count % MAX_ATTEMPTS);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `كلمة المرور غير صحيحة — ${remaining} محاولة متبقية`,
        });
      }

      // Clear failed attempts on success
      loginAttempts.delete(ip);

      const token = randomBytes(32).toString("hex");
      sessions.set(token, Date.now() + SESSION_TTL);
      return { token };
    }),

  logout: publicQuery.mutation(({ ctx }) => {
    const token = ctx.req.headers.get("x-admin-token");
    if (token) sessions.delete(token);
    return { ok: true };
  }),

  verify: publicQuery.query(({ ctx }) => {
    const token = ctx.req.headers.get("x-admin-token");
    return { valid: validateAdminSession(token) };
  }),
});
