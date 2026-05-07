import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: 0 },
    queries: { retry: 1, staleTime: 30_000 },
  },
});
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 180_000);
        const sessionToken = localStorage.getItem("session_token");
        const adminToken = sessionStorage.getItem("masoul_admin_token");
        const headers = new Headers(init?.headers);
        if (sessionToken) headers.set("x-session-token", sessionToken);
        if (adminToken) headers.set("x-admin-token", adminToken);
        return globalThis
          .fetch(input, {
            ...(init ?? {}),
            credentials: "include",
            headers,
            signal: controller.signal,
          })
          .finally(() => clearTimeout(timer));
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
