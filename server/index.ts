import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

const app = express();

const allowed = process.env.CORS_ORIGIN?.split(",") ?? [ "http://localhost:5173",
  "http://localhost:5174",
  "https://elegantshop-frontend.vercel.app"];
app.use(cors({ origin: allowed, credentials: true }));
app.use(express.json());

// health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// mount all API routes
registerRoutes(app);

export default app;

// local dev only
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}
