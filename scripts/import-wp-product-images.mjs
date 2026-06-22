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

await loadEnvFile(".env.local");
await loadEnvFile(".env");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local before running this script.");
}

const productsPath = path.join(process.cwd(), "lib", "products.json");
const rawProducts = JSON.parse(await readFile(productsPath, "utf8"));

const imageRecords = rawProducts
  .map((item) => ({
    slug: typeof item.slug === "string" ? item.slug.trim() : "",
    imageUrl: typeof item.image === "string" ? item.image.trim() : "",
  }))
  .filter((item) => item.slug && item.imageUrl);

const dedupedRecords = [];
const seen = new Set();

for (const record of imageRecords) {
  const key = `${record.slug}:${record.imageUrl}`;
  if (seen.has(key)) {
    continue;
  }

  seen.add(key);
  dedupedRecords.push(record);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  await pool.query(`
    create table if not exists product_images (
      id bigint generated always as identity primary key,
      product_id text not null references products(id) on delete cascade,
      image_url text not null,
      alt_text text,
      source text not null default 'wordpress-import',
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create unique index if not exists idx_product_images_unique
      on product_images(product_id, image_url);

    create index if not exists idx_product_images_product_id
      on product_images(product_id);
  `);

  const productsResult = await pool.query(
    "select id, slug from products",
  );
  const productIdBySlug = new Map(
    productsResult.rows.map((row) => [row.slug, row.id]),
  );

  const matchedRecords = dedupedRecords
    .map((record) => ({
      ...record,
      productId: productIdBySlug.get(record.slug),
    }))
    .filter((record) => record.productId);

  await pool.query("begin");
  await pool.query(
    "delete from product_images where source = 'wordpress-import'",
  );

  for (const [index, record] of matchedRecords.entries()) {
    await pool.query(
      `
        insert into product_images (
          product_id,
          image_url,
          alt_text,
          source,
          sort_order,
          updated_at
        ) values ($1, $2, $3, 'wordpress-import', $4, now())
        on conflict (product_id, image_url) do update
        set
          alt_text = excluded.alt_text,
          sort_order = excluded.sort_order,
          updated_at = now()
      `,
      [
        record.productId,
        record.imageUrl,
        `${record.slug} product image`,
        index,
      ],
    );
  }

  await pool.query("commit");
  console.log(`Imported ${matchedRecords.length} WordPress product image records into Neon.`);
} catch (error) {
  await pool.query("rollback");
  throw error;
} finally {
  await pool.end();
}
