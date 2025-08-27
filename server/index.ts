// server/index.ts
import express from "express";
const cors = require("cors");
import { db, pool } from "./db.js";
// import { users } from "./drizzle/schema"; // example

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*", credentials: true }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT 1 AS ok");
    res.json({ ok: rows[0].ok === 1 });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Example drizzle query:
// app.get("/api/users", async (_req, res) => {
//   const data = await db.select().from(users).limit(50);
//   res.json(data);
// });

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}
