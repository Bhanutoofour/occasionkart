import { Pool } from "pg";

declare global {
  var __ockPool: Pool | undefined;
}

const localDatabaseUrl = "postgres://postgres:postgres@127.0.0.1:5432/occasionkart";

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? localDatabaseUrl;

  if (!process.env.DATABASE_URL) {
    return databaseUrl;
  }

  try {
    const parsedUrl = new URL(databaseUrl);
    const sslMode = parsedUrl.searchParams.get("sslmode");

    if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
      parsedUrl.searchParams.set("sslmode", "verify-full");
      return parsedUrl.toString();
    }
  } catch {
    return databaseUrl;
  }

  return databaseUrl;
}

function createPool() {
  return new Pool({
    connectionString: getDatabaseUrl(),
  });
}

export const db = globalThis.__ockPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ockPool = db;
}
