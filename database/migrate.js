const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: ".env" });

async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in .env");
  }

  const isRemoteDb =
    process.env.DATABASE_URL.includes("neon.tech") ||
    process.env.DATABASE_URL.includes("sslmode=require");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isRemoteDb
      ? {
          rejectUnauthorized: false,
        }
      : false,
  });

  try {
    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (!file.endsWith(".sql")) continue;

      const sql = fs.readFileSync(
        path.join(migrationsDir, file),
        "utf8"
      );

      console.log(`Running migration: ${file}`);
      await pool.query(sql);
      console.log(`✔ ${file} completed`);
    }

    console.log("\n✔ All migrations completed");
  } finally {
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});