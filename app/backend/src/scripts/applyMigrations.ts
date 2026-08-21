import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";

import Database from "better-sqlite3";

function resolveDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error("Only SQLite file: DATABASE_URL values are supported by this migration runner.");
  }

  const filePath = databaseUrl.slice("file:".length);

  return isAbsolute(filePath) ? filePath : resolve(process.cwd(), filePath);
}

function ensureMigrationsTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);
}

const databasePath = resolveDatabasePath();
mkdirSync(dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
ensureMigrationsTable(db);

const migrationsPath = resolve(process.cwd(), "prisma", "migrations");
const appliedMigrations = new Set(
  (db
    .prepare('SELECT "migration_name" FROM "_prisma_migrations" WHERE "rolled_back_at" IS NULL')
    .all() as { migration_name: string }[])
    .map((row) => row.migration_name),
);

const migrationNames = readdirSync(migrationsPath, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const applyMigration = db.transaction((migrationName: string, sql: string) => {
  db.exec(sql);
  db.prepare(`
    INSERT INTO "_prisma_migrations" (
      "id",
      "checksum",
      "finished_at",
      "migration_name",
      "logs",
      "rolled_back_at",
      "applied_steps_count"
    ) VALUES (?, ?, current_timestamp, ?, NULL, NULL, 1)
  `).run(randomUUID(), createHash("sha256").update(sql).digest("hex"), migrationName);
});

let appliedCount = 0;

for (const migrationName of migrationNames) {
  if (appliedMigrations.has(migrationName)) {
    continue;
  }

  const sql = readFileSync(resolve(migrationsPath, migrationName, "migration.sql"), "utf8");
  applyMigration(migrationName, sql);
  appliedCount += 1;
}

console.log(`SQLite migrations applied: ${appliedCount}`);
db.close();
