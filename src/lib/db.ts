import { Pool } from "pg";

let db: Pool;

if (!(globalThis as any).__db) {
  (globalThis as any).__db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

db = (globalThis as any).__db;

export { db };