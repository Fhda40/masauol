import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

/* ── PDF extraction endpoint (10 MB limit, before global limit) ── */
app.post("/api/pdf/extract", async (c) => {
  try {
    const contentLength = parseInt(c.req.header("content-length") || "0");
    if (contentLength > 10 * 1024 * 1024) {
      return c.json({ error: "الملف كبير جداً — الحد الأقصى 10MB" }, 413);
    }

    const formData = await c.req.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) return c.json({ error: "لم يُرفع ملف" }, 400);
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return c.json({ error: "يُسمح بملفات PDF فقط" }, 400);
    }
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: "الملف كبير جداً — الحد الأقصى 10MB" }, 413);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { default: pdfParse } = await import("pdf-parse");
    const data = await pdfParse(buffer);

    /* Trim to 8,000 characters so it fits in the AI context */
    const text = data.text.replace(/\s+/g, " ").trim().slice(0, 8000);

    return c.json({ text, pages: data.numpages, filename: file.name });
  } catch {
    return c.json({ error: "تعذّر قراءة الملف — تأكد أن الـ PDF ليس مشفراً" }, 422);
  }
});

app.use(bodyLimit({ maxSize: 1 * 1024 * 1024 })); // 1 MB for all other routes
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
