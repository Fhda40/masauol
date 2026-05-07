import { initTRPC, TRPCError } from "@trpc/server";
import { createHmac } from "crypto";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { env } from "./lib/env";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

function getAdminToken() {
  return createHmac("sha256", env.adminPassword).update("masoul-admin-v1").digest("hex");
}

export const createRouter = t.router;
export const publicQuery = t.procedure;
export { getAdminToken };

export const adminProtected = t.procedure.use(async ({ ctx, next }) => {
  const token = ctx.req.headers.get("x-admin-token");
  if (!token || token !== getAdminToken()) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "غير مصرح" });
  }
  return next({ ctx });
});
