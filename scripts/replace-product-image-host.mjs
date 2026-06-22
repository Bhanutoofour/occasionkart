import { readFile } from "node:fs/promises";
import path from "node:path";

import pg from "pg";

const { Pool } = pg;

async function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);

  try {
    const content = await readFile(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env files.
  }
}

function parseArgs(argv) {
  const values = new Map();
  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      continue;
    }
    const [rawKey, ...rest] = arg.slice(2).split("=");
    const key = rawKey.trim();
    const value = rest.join("=").trim();
    values.set(key, value || "true");
  }
  return values;
}

function normalizePrefix(value, label) {
  const normalized = (value ?? "").trim();
  if (!normalized) {
    throw new Error(`Missing required --${label} argument.`);
  }

  try {
    // Validates URL format.
    new URL(normalized);
  } catch {
    throw new Error(`Invalid --${label} URL: ${normalized}`);
  }

  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

await loadEnvFile(".env.local");
await loadEnvFile(".env");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local before running this script.");
}

const args = parseArgs(process.argv.slice(2));
const fromPrefix = normalizePrefix(
  args.get("from") ?? "https://occasionkart.com/wp-content/uploads",
  "from",
);
const toPrefix = normalizePrefix(args.get("to"), "to");
const dryRun = (args.get("dry-run") ?? "false").toLowerCase() === "true";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const targets = [
  { table: "products", column: "image" },
  { table: "product_images", column: "image_url" },
];

try {
  const preview = [];
  for (const target of targets) {
    const countSql = `
      select count(*)::int as count
      from ${target.table}
      where ${target.column} like $1
    `;
    const sampleSql = `
      select ${target.column} as value
      from ${target.table}
      where ${target.column} like $1
      order by ${target.column} asc
      limit 3
    `;
    const likePattern = `${fromPrefix}%`;

    const [countResult, sampleResult] = await Promise.all([
      pool.query(countSql, [likePattern]),
      pool.query(sampleSql, [likePattern]),
    ]);

    preview.push({
      table: target.table,
      column: target.column,
      count: countResult.rows[0]?.count ?? 0,
      sample: sampleResult.rows.map((row) => row.value),
    });
  }

  const total = preview.reduce((sum, item) => sum + item.count, 0);
  console.log(`From: ${fromPrefix}`);
  console.log(`To:   ${toPrefix}`);
  console.log(`Rows that match old prefix: ${total}`);
  for (const item of preview) {
    console.log(`- ${item.table}.${item.column}: ${item.count}`);
    for (const value of item.sample) {
      console.log(`  sample: ${value}`);
    }
  }

  if (dryRun) {
    console.log("Dry run only. No updates applied.");
    process.exit(0);
  }

  if (total === 0) {
    console.log("No rows matched the old prefix. Nothing to update.");
    process.exit(0);
  }

  await pool.query("begin");

  for (const target of targets) {
    const updateSql = `
      update ${target.table}
      set ${target.column} = $1 || substring(${target.column} from char_length($2) + 1)
      where ${target.column} like $3
    `;
    const likePattern = `${fromPrefix}%`;
    await pool.query(updateSql, [toPrefix, fromPrefix, likePattern]);
  }

  await pool.query("commit");
  console.log("Image host replacement completed.");
} catch (error) {
  await pool.query("rollback");
  throw error;
} finally {
  await pool.end();
}
