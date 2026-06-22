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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const migrationSql = `
  create table if not exists orders (
    id text primary key,
    order_number text not null unique,
    user_id text,
    status text not null check (
      status in (
        'pending',
        'confirmed',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled'
      )
    ),
    payment_status text not null check (
      payment_status in ('pending', 'paid', 'failed', 'refunded')
    ),
    source text not null check (source in ('web', 'whatsapp', 'phone', 'walk_in')),
    customer_full_name text not null,
    customer_phone text not null,
    customer_email text,
    delivery_date text not null,
    delivery_slot text,
    delivery_address text not null,
    delivery_city text not null default 'Hyderabad',
    cake_message text,
    notes text,
    subtotal integer not null check (subtotal >= 0),
    delivery_fee integer not null check (delivery_fee >= 0),
    total integer not null check (total >= 0),
    currency text not null default 'INR',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table if not exists order_items (
    id bigint generated always as identity primary key,
    order_id text not null references orders(id) on delete cascade,
    product_id text not null,
    slug text not null,
    name text not null,
    image text not null,
    quantity integer not null check (quantity > 0),
    unit_price integer not null check (unit_price >= 0),
    line_total integer not null check (line_total >= 0)
  );

  create index if not exists idx_orders_status on orders(status);
  create index if not exists idx_orders_payment_status on orders(payment_status);
  create index if not exists idx_orders_created_at on orders(created_at desc);
  create index if not exists idx_orders_user_id on orders(user_id);
  create index if not exists idx_order_items_order_id on order_items(order_id);
`;

try {
  await pool.query(migrationSql);
  console.log("Neon order tables are ready.");
} finally {
  await pool.end();
}
