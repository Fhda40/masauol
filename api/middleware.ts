import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

export const adminProtected = t.procedure.use(async ({ ctx, next }) => {
  // Lazy import to avoid circular dependency (admin router imports middleware)
  const { validateAdminSession } = await import("./routers/admin");
  const token = ctx.req.headers.get("x-admin-token");
  if (!validateAdminSession(token)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "جلسة الأدمن منتهية أو غير صالحة" });
  }
  return next({ ctx });
});
