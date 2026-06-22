import { randomUUID } from "node:crypto";
import type { QueryResultRow } from "pg";

import { db } from "@/lib/db";
import rawProducts from "@/lib/products.json";
import { buildProductSeoDescription } from "@/lib/seo-content";
import { getProductImageUrl } from "@/lib/product-images";
import type {
  Product,
  ProductFlavorOption,
  ProductMutationInput,
  ProductWeightOption,
  RawProductRecord,
} from "@/lib/store-schema";
import {
  extractBaseWeightFromDescription,
  normalizeFlavorOptions,
  normalizeProductRecord,
  normalizeWeightOptions,
  slugifyOptionId,
} from "@/lib/store-schema";

export type ProductFilters = {
  category?: string | null;
  query?: string | null;
  sort?: string | null;
  limit?: number | null;
};

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

let ensureCatalogSchemaPromise: Promise<void> | null = null;

const fallbackCatalog = (rawProducts as RawProductRecord[]).map(normalizeProductRecord);

type ProductRow = QueryResultRow & {
  id: string;
  sort_order: number;
  slug: string;
  name: string;
  category: string;
  flavor: string;
  description: string;
  price: number;
  serves: string;
  lead_time: string;
  image: string;
  accent: string;
  highlights: string[];
  categories: string[];
  weight_options: ProductWeightOption[] | null;
  flavor_options: ProductFlavorOption[] | null;
};

function mapProductRows(rows: ProductRow[]): Product[] {
  return rows.map((row) => ({
    ...(function () {
      const baseWeightKg =
        row.weight_options && row.weight_options.length > 0
          ? Math.min(...row.weight_options.map((option) => Number(option.kilograms) || Infinity))
          : extractBaseWeightFromDescription(row.description);
      const maxWeightKg =
        row.weight_options && row.weight_options.length > 0
          ? Math.max(...row.weight_options.map((option) => Number(option.kilograms) || 0))
          : Math.max(4, baseWeightKg ?? 1);
      const isEligibleForVariants = Number.isFinite(baseWeightKg) && (baseWeightKg ?? 0) > 0;

      return {
        weightOptions: isEligibleForVariants
          ? normalizeWeightOptions(
              row.weight_options,
              row.price,
              row.serves,
              baseWeightKg,
              maxWeightKg,
            )
          : [],
        flavorOptions: isEligibleForVariants
          ? normalizeFlavorOptions(row.flavor_options)
          : [],
      };
    })(),
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    flavor: row.flavor,
    description: buildProductSeoDescription({
      name: row.name,
      category: row.category,
      description: row.description,
      leadTime: row.lead_time,
    }),
    price: row.price,
    serves: row.serves,
    leadTime: row.lead_time,
    image: getProductImageUrl(row.image),
    accent: row.accent,
    highlights: row.highlights ?? [],
    categories: row.categories ?? [],
  }));
}

async function ensureCatalogSchema() {
  if (!ensureCatalogSchemaPromise) {
    ensureCatalogSchemaPromise = (async () => {
      await db.query(
        "alter table products add column if not exists weight_options jsonb not null default '[]'::jsonb",
      );
      await db.query(
        "alter table products add column if not exists flavor_options jsonb not null default '[]'::jsonb",
      );
    })();
  }

  await ensureCatalogSchemaPromise;
}

function buildBaseProductSelect() {
  return `
    select
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
      weight_options,
      flavor_options
    from products
  `;
}

function isCatalogConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const maybeCode = "code" in error ? String(error.code) : "";
  const message = error.message.toLowerCase();
  return [
    "ENOTFOUND",
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "EAI_AGAIN",
    "57P01",
    "53300",
  ].includes(maybeCode) || (maybeCode === "XX000" && message.includes("data transfer quota"));
}

function filterFallbackProducts(products: Product[], filters: ProductFilters = {}) {
  const category = filters.category?.trim().toLowerCase();
  const query = filters.query?.trim().toLowerCase();

  let filtered = products.filter((product) => {
    const matchesCategory = category
      ? product.categories.some((item) => item.toLowerCase() === category)
      : true;
    const haystack = [
      product.name,
      product.description,
      product.category,
      ...product.categories,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = query ? haystack.includes(query) : true;
    return matchesCategory && matchesQuery;
  });

  if (filters.sort === "price-asc") {
    filtered = [...filtered].sort((left, right) => left.price - right.price || left.name.localeCompare(right.name));
  } else if (filters.sort === "price-desc") {
    filtered = [...filtered].sort((left, right) => right.price - left.price || left.name.localeCompare(right.name));
  } else if (filters.sort === "name-asc") {
    filtered = [...filtered].sort((left, right) => left.name.localeCompare(right.name));
  } else {
    filtered = [...filtered].sort((left, right) => left.name.localeCompare(right.name));
  }

  if (filters.limit && filters.limit > 0) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

function listFallbackTopCategories(limit = 12) {
  const counts = new Map<string, number>();
  for (const product of fallbackCatalog) {
    for (const category of product.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([category]) => category);
}

function listFallbackCategorySummaries(limit = 100) {
  const counts = new Map<string, number>();
  for (const product of fallbackCatalog) {
    for (const category of product.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export async function listProducts(filters: ProductFilters = {}) {
  try {
    await ensureCatalogSchema();

    const values: unknown[] = [];
    const conditions: string[] = [];
    const category = filters.category?.trim();
    const query = filters.query?.trim();

    if (category) {
      values.push(category.toLowerCase());
      conditions.push(`
        exists (
          select 1
          from unnest(categories) as category_item
          where lower(category_item) = $${values.length}
        )
      `);
    }

    if (query) {
      values.push(`%${query.toLowerCase()}%`);
      conditions.push(`
        (
          lower(name) like $${values.length}
          or lower(description) like $${values.length}
          or lower(category) like $${values.length}
          or exists (
            select 1
            from unnest(categories) as category_item
            where lower(category_item) like $${values.length}
          )
        )
      `);
    }

    let queryText = buildBaseProductSelect();

    if (conditions.length > 0) {
      queryText += ` where ${conditions.join(" and ")}`;
    }

    if (filters.sort === "price-asc") {
      queryText += " order by price asc, name asc";
    } else if (filters.sort === "price-desc") {
      queryText += " order by price desc, name asc";
    } else if (filters.sort === "name-asc") {
      queryText += " order by name asc";
    } else {
      queryText += " order by sort_order asc, name asc";
    }

    if (filters.limit && filters.limit > 0) {
      values.push(filters.limit);
      queryText += ` limit $${values.length}`;
    }

    const result = await db.query<ProductRow>(queryText, values);
    return mapProductRows(result.rows);
  } catch (error) {
    if (!isCatalogConnectionError(error)) {
      throw error;
    }

    console.warn("Catalog DB unavailable, using local fallback catalog.", error);
    return filterFallbackProducts(fallbackCatalog, filters);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    await ensureCatalogSchema();

    const result = await db.query<ProductRow>(
      `${buildBaseProductSelect()} where slug = $1 limit 1`,
      [slug],
    );

    return mapProductRows(result.rows)[0];
  } catch (error) {
    if (!isCatalogConnectionError(error)) {
      throw error;
    }

    console.warn(`Catalog DB unavailable while loading product "${slug}", using fallback catalog.`, error);
    return fallbackCatalog.find((product) => product.slug === slug);
  }
}

export async function listTopCategories(limit = 12) {
  try {
    await ensureCatalogSchema();

    const result = await db.query<{ category_name: string; count: number }>(
      `
        select
          category_name,
          count(*)::int as count
        from (
          select unnest(categories) as category_name
          from products
        ) expanded
        group by category_name
        order by count desc, category_name asc
        limit $1
      `,
      [limit],
    );

    return result.rows.map((row) => row.category_name);
  } catch (error) {
    if (!isCatalogConnectionError(error)) {
      throw error;
    }

    console.warn("Catalog DB unavailable while loading top categories, using fallback catalog.", error);
    return listFallbackTopCategories(limit);
  }
}

export type CategorySummary = {
  name: string;
  count: number;
};

export type CatalogStats = {
  totalProducts: number;
  totalCategories: number;
};

export type BulkCategoryUpdateInput = {
  productIds: string[];
  category: string;
  action: "add" | "remove";
};

export async function listCategorySummaries(limit = 100) {
  try {
    await ensureCatalogSchema();

    const result = await db.query<{ category_name: string; count: number }>(
      `
        select
          category_name,
          count(*)::int as count
        from (
          select unnest(categories) as category_name
          from products
        ) expanded
        group by category_name
        order by count desc, category_name asc
        limit $1
      `,
      [limit],
    );

    return result.rows.map((row) => ({
      name: row.category_name,
      count: row.count,
    }));
  } catch (error) {
    if (!isCatalogConnectionError(error)) {
      throw error;
    }

    console.warn("Catalog DB unavailable while loading category summaries, using fallback catalog.", error);
    return listFallbackCategorySummaries(limit);
  }
}

export async function getCatalogStats(): Promise<CatalogStats> {
  try {
    await ensureCatalogSchema();

    const [productsResult, categories] = await Promise.all([
      db.query<{ count: number }>("select count(*)::int as count from products"),
      listCategorySummaries(500),
    ]);

    return {
      totalProducts: productsResult.rows[0]?.count ?? 0,
      totalCategories: categories.length,
    };
  } catch (error) {
    if (!isCatalogConnectionError(error)) {
      throw error;
    }

    console.warn("Catalog DB unavailable while loading stats, using fallback catalog.", error);
    const categories = listFallbackCategorySummaries(500);
    return {
      totalProducts: fallbackCatalog.length,
      totalCategories: categories.length,
    };
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseWeightOptions(
  value: unknown,
  basePrice: number,
  serves: string,
): ProductWeightOption[] {
  if (!Array.isArray(value)) {
    return normalizeWeightOptions([], basePrice, serves);
  }

  return normalizeWeightOptions(
    value.map((item) => {
      const source = item as Record<string, unknown>;
      return {
        id: slugifyOptionId(String(source.id ?? source.label ?? "")),
        label: String(source.label ?? "").trim(),
        kilograms: Number(source.kilograms ?? 0),
        price: Number(source.price ?? NaN),
        serves: isNonEmptyString(source.serves) ? source.serves.trim() : serves,
      };
    }),
    basePrice,
    serves,
  );
}

function parseFlavorOptions(value: unknown): ProductFlavorOption[] {
  if (!Array.isArray(value)) {
    return normalizeFlavorOptions([]);
  }

  return normalizeFlavorOptions(
    value.map((item) => {
      const source = item as Record<string, unknown>;
      return {
        id: slugifyOptionId(String(source.id ?? source.label ?? "")),
        label: String(source.label ?? "").trim(),
        pricePerKg: Number(source.pricePerKg ?? NaN),
      };
    }),
  );
}

function normalizeProductInput(payload: unknown): ValidationResult<ProductMutationInput> {
  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "request body must be a JSON object" };
  }

  const source = payload as Record<string, unknown>;
  if (!isNonEmptyString(source.name)) {
    return { ok: false, message: "name is required" };
  }

  const parsedPrice =
    typeof source.price === "number" ? source.price : Number(source.price ?? NaN);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { ok: false, message: "price must be a valid non-negative number" };
  }

  const name = source.name.trim();
  const categories = parseStringArray(source.categories);
  const category =
    isNonEmptyString(source.category) ? source.category.trim() : categories[0] ?? "Cakes";
  const slugSource = isNonEmptyString(source.slug) ? source.slug.trim() : name;
  const slug = slugify(slugSource);

  if (!slug) {
    return { ok: false, message: "slug is required" };
  }

  const serves = isNonEmptyString(source.serves) ? source.serves.trim() : "Serves 6-8";
  const description = isNonEmptyString(source.description) ? source.description.trim() : "";
  const providedWeightOptions = Array.isArray(source.weightOptions) ? source.weightOptions : [];
  const providedFlavorOptions = Array.isArray(source.flavorOptions) ? source.flavorOptions : [];
  const describedBaseWeightKg = extractBaseWeightFromDescription(description);
  const parsedWeightOptions =
    providedWeightOptions.length > 0
      ? parseWeightOptions(providedWeightOptions, Math.round(parsedPrice), serves)
      : [];
  const inferredBaseWeightKg =
    parsedWeightOptions.length > 0
      ? Math.min(...parsedWeightOptions.map((option) => option.kilograms))
      : describedBaseWeightKg;
  const inferredMaxWeightKg =
    parsedWeightOptions.length > 0
      ? Math.max(...parsedWeightOptions.map((option) => option.kilograms))
      : Math.max(4, inferredBaseWeightKg ?? 1);
  const isEligibleForVariants = parsedWeightOptions.length > 0 || providedFlavorOptions.length > 0;

  return {
    ok: true,
    value: {
      name,
      slug,
      category,
      flavor: isNonEmptyString(source.flavor) ? source.flavor.trim() : category,
      description,
      price: Math.round(parsedPrice),
      serves,
      leadTime: isNonEmptyString(source.leadTime) ? source.leadTime.trim() : "Same day",
      image: getProductImageUrl(isNonEmptyString(source.image) ? source.image.trim() : ""),
      accent: isNonEmptyString(source.accent)
        ? source.accent.trim()
        : "from-rose-100 via-orange-50 to-amber-100",
      highlights: parseStringArray(source.highlights),
      categories: categories.length > 0 ? categories : [category],
      weightOptions: isEligibleForVariants
        ? normalizeWeightOptions(
            parsedWeightOptions,
            Math.round(parsedPrice),
            serves,
            inferredBaseWeightKg ?? 1,
            inferredMaxWeightKg,
          )
        : [],
      flavorOptions: isEligibleForVariants ? parseFlavorOptions(providedFlavorOptions) : [],
    },
  };
}

async function getNextSortOrder() {
  const result = await db.query<{ sort_order: number }>(
    "select coalesce(max(sort_order), -1)::int as sort_order from products",
  );

  return (result.rows[0]?.sort_order ?? -1) + 1;
}

export async function createProduct(payload: unknown): Promise<ValidationResult<Product>> {
  await ensureCatalogSchema();

  const normalized = normalizeProductInput(payload);
  if (!normalized.ok) {
    return normalized;
  }

  const existing = await getProductBySlug(normalized.value.slug);
  if (existing) {
    return { ok: false, message: "a product with this slug already exists" };
  }

  const sortOrder = await getNextSortOrder();
  const id = randomUUID();

  await db.query(
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
        weight_options,
        flavor_options,
        updated_at
      ) values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::text[], $14::text[], $15::jsonb, $16::jsonb, now()
      )
    `,
    [
      id,
      sortOrder,
      normalized.value.slug,
      normalized.value.name,
      normalized.value.category,
      normalized.value.flavor,
      normalized.value.description,
      normalized.value.price,
      normalized.value.serves,
      normalized.value.leadTime,
      normalized.value.image,
      normalized.value.accent,
      normalized.value.highlights,
      normalized.value.categories,
      JSON.stringify(normalized.value.weightOptions),
      JSON.stringify(normalized.value.flavorOptions),
    ],
  );

  const product = await getProductBySlug(normalized.value.slug);
  if (!product) {
    return { ok: false, message: "product was created but could not be loaded" };
  }

  return { ok: true, value: product };
}

export async function updateProduct(
  id: string,
  payload: unknown,
): Promise<ValidationResult<Product>> {
  await ensureCatalogSchema();

  const normalized = normalizeProductInput(payload);
  if (!normalized.ok) {
    return normalized;
  }

  const duplicateSlug = await db.query<{ id: string }>(
    "select id from products where slug = $1 and id <> $2 limit 1",
    [normalized.value.slug, id],
  );
  if (duplicateSlug.rows.length > 0) {
    return { ok: false, message: "another product already uses this slug" };
  }

  const result = await db.query<{ slug: string }>(
    `
      update products
      set
        slug = $2,
        name = $3,
        category = $4,
        flavor = $5,
        description = $6,
        price = $7,
        serves = $8,
        lead_time = $9,
        image = $10,
        accent = $11,
        highlights = $12::text[],
        categories = $13::text[],
        weight_options = $14::jsonb,
        flavor_options = $15::jsonb,
        updated_at = now()
      where id = $1
      returning slug
    `,
    [
      id,
      normalized.value.slug,
      normalized.value.name,
      normalized.value.category,
      normalized.value.flavor,
      normalized.value.description,
      normalized.value.price,
      normalized.value.serves,
      normalized.value.leadTime,
      normalized.value.image,
      normalized.value.accent,
      normalized.value.highlights,
      normalized.value.categories,
      JSON.stringify(normalized.value.weightOptions),
      JSON.stringify(normalized.value.flavorOptions),
    ],
  );

  if (result.rows.length === 0) {
    return { ok: false, message: "product not found" };
  }

  const product = await getProductBySlug(result.rows[0].slug);
  if (!product) {
    return { ok: false, message: "product was updated but could not be loaded" };
  }

  return { ok: true, value: product };
}

export async function bulkUpdateProductCategories(
  input: BulkCategoryUpdateInput,
): Promise<ValidationResult<{ updatedCount: number }>> {
  await ensureCatalogSchema();

  const category = input.category.trim();
  const productIds = [...new Set(input.productIds.map((id) => id.trim()).filter(Boolean))];

  if (!category) {
    return { ok: false, message: "category is required" };
  }

  if (productIds.length === 0) {
    return { ok: false, message: "select at least one product" };
  }

  const normalizedCategory = category
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const selectedProducts = await db.query<{ id: string; categories: string[]; category: string }>(
    "select id, categories, category from products where id = any($1::text[])",
    [productIds],
  );

  if (selectedProducts.rows.length === 0) {
    return { ok: false, message: "products not found" };
  }

  let updatedCount = 0;

  for (const product of selectedProducts.rows) {
    const existingCategories = Array.isArray(product.categories) ? product.categories : [];
    const nextCategories =
      input.action === "add"
        ? Array.from(new Set([...existingCategories, normalizedCategory]))
        : existingCategories.filter((item) => item.toLowerCase() !== normalizedCategory.toLowerCase());

    const nextPrimaryCategory =
      nextCategories[0] ?? (product.category.toLowerCase() === normalizedCategory.toLowerCase() ? "Cakes" : product.category);

    const changed =
      nextPrimaryCategory !== product.category ||
      nextCategories.length !== existingCategories.length ||
      nextCategories.some((item, index) => item !== existingCategories[index]);

    if (!changed) {
      continue;
    }

    await db.query(
      `
        update products
        set
          category = $2,
          categories = $3::text[],
          updated_at = now()
        where id = $1
      `,
      [product.id, nextPrimaryCategory, nextCategories],
    );
    updatedCount += 1;
  }

  return { ok: true, value: { updatedCount } };
}
