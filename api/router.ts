import { createRouter, publicQuery } from "./middleware";
import { conversationRouter } from "./routers/conversation";
import { messageRouter } from "./routers/message";
import { chatRouter } from "./routers/chat";
import { leadRouter } from "./routers/lead";
import { legalRouter } from "./routers/legal";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  conversation: conversationRouter,
  message: messageRouter,
  chat: chatRouter,
  lead: leadRouter,
  legal: legalRouter,
});

export type AppRouter = typeof appRouter;
