import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, getAdminToken } from "../middleware";
import { env } from "../lib/env";

export const adminRouter = createRouter({
  login: publicQuery
    .input(z.object({ password: z.string().max(200) }))
    .mutation(({ input }) => {
      if (input.password !== env.adminPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور غير صحيحة" });
      }
      return { token: getAdminToken() };
    }),
});
