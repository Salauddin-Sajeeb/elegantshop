// server/db.ts
import pg from "pg"; // CJS default import
import { drizzle } from "drizzle-orm/node-postgres";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon requires TLS; safe even if your URL already has sslmode=require
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool);
