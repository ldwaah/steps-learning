import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth.js";
import { meRoutes } from "./routes/me.js";
import { studentRoutes } from "./routes/student.js";
import { trustRoutes } from "./routes/trust.js";

const app = new Hono();

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return corsOrigins[0] ?? "http://localhost:5173";
      if (corsOrigins.includes(origin)) return origin;
      return corsOrigins[0] ?? "http://localhost:5173";
    },
    credentials: true,
  }),
);

app.get("/api/health", (c) =>
  c.json({
    ok: true,
    service: "steps-api",
    version: "0.1.0",
    mode: "trust-platform",
  }),
);

app.route("/api/auth", authRoutes);
app.route("/api/me", meRoutes);
app.route("/api/trust", trustRoutes);
app.route("/api/student", studentRoutes);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Steps API listening on http://localhost:${port}`);
});
