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

const fallbackAccent = "from-rose-100 via-orange-50 to-amber-100";
const fallbackHighlights = ["Freshly baked", "Hyderabad delivery"];
const fallbackImage =
  "https://images.unsplash.com/photo-1541781286675-9bca0d6d7d07?auto=format&fit=crop&w=900&q=80";

function normalizeProductRecord(item, index) {
  const normalizedCategories = Array.isArray(item.categories)
    ? item.categories
    : item.categories
      ? [item.categories]
      : [];
  const primaryCategory = normalizedCategories[0] ?? "Cakes";

  return {
    id: String(item.id),
    sortOrder: index,
    slug: item.slug,
    name: item.name,
    category: primaryCategory,
    flavor: primaryCategory,
    description: item.description ?? "",
    price: item.price ?? 0,
    serves: "Serves 6-8",
    leadTime: "Same day",
    image: item.image ?? fallbackImage,
    accent: fallbackAccent,
    highlights: fallbackHighlights,
    categories: normalizedCategories,
  };
}

await loadEnvFile(".env.local");
await loadEnvFile(".env");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local before running this script.");
}

const productsPath = path.join(process.cwd(), "lib", "products.json");
const rawProducts = JSON.parse(await readFile(productsPath, "utf8"));
const dedupedProducts = [];
const seenSlugs = new Set();

for (const [index, item] of rawProducts.entries()) {
  const product = normalizeProductRecord(item, index);
  if (seenSlugs.has(product.slug)) {
    continue;
  }

  seenSlugs.add(product.slug);
  dedupedProducts.push(product);
}

const products = dedupedProducts.map((product, index) => ({
  ...product,
  sortOrder: index,
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createProductsTableSql = `
  create table if not exists products (
    id text primary key,
    sort_order integer not null default 0,
    slug text not null unique,
    name text not null,
    category text not null,
    flavor text not null,
    description text not null,
    price integer not null check (price >= 0),
    serves text not null,
    lead_time text not null,
    image text not null,
    accent text not null,
    highlights text[] not null default '{}',
    categories text[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  alter table products add column if not exists sort_order integer not null default 0;
  alter table products add column if not exists category text not null default 'Cakes';
  alter table products add column if not exists flavor text not null default 'Cakes';
  alter table products add column if not exists description text not null default '';
  alter table products add column if not exists serves text not null default 'Serves 6-8';
  alter table products add column if not exists lead_time text not null default 'Same day';
  alter table products add column if not exists image text not null default '${fallbackImage}';
  alter table products add column if not exists accent text not null default '${fallbackAccent}';
  alter table products add column if not exists highlights text[] not null default '{}';
  alter table products add column if not exists categories text[] not null default '{}';
  alter table products add column if not exists created_at timestamptz not null default now();
  alter table products add column if not exists updated_at timestamptz not null default now();

  create index if not exists idx_products_slug on products(slug);
  create index if not exists idx_products_category on products(category);
`;

try {
  await pool.query(createProductsTableSql);
  await pool.query("begin");
  await pool.query("truncate table products");
  for (const product of products) {
    await pool.query(
      `
        insert into products (
          id,
          sort_order,
          slug,
          name,
          category,
          flavor,
          description,
          price,
          serves,
          lead_time,
          image,
          accent,
          highlights,
          categories,
          updated_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::text[], $14::text[], now()
        )
      `,
      [
        product.id,
        product.sortOrder,
        product.slug,
        product.name,
        product.category,
        product.flavor,
        product.description,
        product.price,
        product.serves,
        product.leadTime,
        product.image,
        product.accent,
        product.highlights,
        product.categories,
      ],
    );
  }
  await pool.query("commit");
  console.log(`Seeded ${products.length} products into Neon.`);
} catch (error) {
  await pool.query("rollback");
  throw error;
} finally {
  await pool.end();
}
