import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

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

function getRequiredEnv(name) {
  const value = (process.env[name] ?? "").trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toBoolean(value, defaultValue = false) {
  if (value == null) {
    return defaultValue;
  }
  const normalized = String(value).trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function toInteger(value, defaultValue) {
  if (value == null) {
    return defaultValue;
  }
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return defaultValue;
  }
  return parsed;
}

function normalizePrefix(value, fallback) {
  const source = (value ?? fallback).trim();
  if (!source) {
    throw new Error("Image source prefix is empty.");
  }
  if (/^https?:\/\/$/i.test(source)) {
    return source;
  }
  return source.endsWith("/") ? source.slice(0, -1) : source;
}

function sanitizeSegment(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildPublicId(urlString) {
  let filename = "image";
  let year = "misc";
  let month = "misc";

  try {
    const parsed = new URL(urlString);
    const segments = parsed.pathname.split("/").filter(Boolean);
    year = sanitizeSegment(segments.at(-3) ?? "misc") || "misc";
    month = sanitizeSegment(segments.at(-2) ?? "misc") || "misc";
    filename = sanitizeSegment((segments.at(-1) ?? "image").split(".")[0]) || "image";
  } catch {
    // Fallback values are already set.
  }

  const hash = createHash("sha1").update(urlString).digest("hex").slice(0, 10);
  return `${year}/${month}/${filename}-${hash}`;
}

function buildSignature(params, apiSecret) {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && String(value).length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`);

  return createHash("sha1")
    .update(`${entries.join("&")}${apiSecret}`)
    .digest("hex");
}

async function fetchBuffer(url, { referer, cookie }) {
  const response = await fetch(url, {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      ...(referer ? { Referer: referer } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    redirect: "follow",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const sample = body.slice(0, 120).replace(/\s+/g, " ").trim();
    throw new Error(`download_failed status=${response.status} body="${sample}"`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`download_not_image content-type=${contentType || "unknown"}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
  };
}

function getContentTypeFromFilePath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".avif") return "image/avif";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function loadBufferFromLocal({ localRoot, sourceUrl, sourcePrefix }) {
  if (!sourceUrl.startsWith(sourcePrefix)) {
    throw new Error("local_source_mismatch_prefix");
  }

  const relative = sourceUrl.slice(sourcePrefix.length).replace(/^\/+/, "");
  const decodedSegments = relative
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

  if (decodedSegments.some((segment) => segment === "..")) {
    throw new Error("local_source_invalid_path_segment");
  }

  const absolutePath = path.join(localRoot, ...decodedSegments);
  const buffer = await readFile(absolutePath);
  return {
    buffer,
    contentType: getContentTypeFromFilePath(absolutePath),
  };
}

async function uploadToCloudinary({
  cloudName,
  apiKey,
  apiSecret,
  folder,
  sourceUrl,
  imageBuffer,
  contentType,
}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = buildPublicId(sourceUrl);
  const paramsToSign = {
    folder,
    overwrite: "true",
    public_id: publicId,
    timestamp,
  };
  const signature = buildSignature(paramsToSign, apiSecret);

  const form = new FormData();
  form.set("api_key", apiKey);
  form.set("timestamp", String(timestamp));
  form.set("signature", signature);
  form.set("folder", folder);
  form.set("public_id", publicId);
  form.set("overwrite", "true");
  form.set("file", new Blob([imageBuffer], { type: contentType }), path.basename(publicId));

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: form,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message ?? response.statusText;
    throw new Error(`upload_failed status=${response.status} message="${message}"`);
  }

  if (!payload?.secure_url) {
    throw new Error("upload_failed missing secure_url in response");
  }

  return payload.secure_url;
}

async function tableExists(pool, tableName) {
  const result = await pool.query(
    `
      select exists(
        select 1
        from information_schema.tables
        where table_schema = 'public' and table_name = $1
      ) as exists
    `,
    [tableName],
  );
  return result.rows[0]?.exists === true;
}

await loadEnvFile(".env.local");
await loadEnvFile(".env");

const args = parseArgs(process.argv.slice(2));
const dryRun = toBoolean(args.get("dry-run"), false);
const limit = toInteger(args.get("limit"), 0);
const sourcePrefix = normalizePrefix(
  args.get("from"),
  "https://occasionkart.com/wp-content/uploads",
);
const folder = (args.get("folder") ?? process.env.CLOUDINARY_FOLDER ?? "occasionkart/products")
  .trim()
  .replace(/^\/+|\/+$/g, "");
const referer = (args.get("referer") ?? process.env.IMAGE_SOURCE_REFERER ?? "").trim();
const cookie = (args.get("cookie") ?? process.env.IMAGE_SOURCE_COOKIE ?? "").trim();
const localRootArg = (args.get("local-root") ?? process.env.IMAGE_SOURCE_LOCAL_ROOT ?? "").trim();
const localRoot = localRootArg ? path.resolve(localRootArg) : "";

const databaseUrl = getRequiredEnv("DATABASE_URL");
const cloudName = dryRun ? (process.env.CLOUDINARY_CLOUD_NAME ?? "").trim() : getRequiredEnv("CLOUDINARY_CLOUD_NAME");
const apiKey = dryRun ? (process.env.CLOUDINARY_API_KEY ?? "").trim() : getRequiredEnv("CLOUDINARY_API_KEY");
const apiSecret = dryRun ? (process.env.CLOUDINARY_API_SECRET ?? "").trim() : getRequiredEnv("CLOUDINARY_API_SECRET");

const pool = new Pool({
  connectionString: databaseUrl,
});

let inTransaction = false;

try {
  const hasProductImages = await tableExists(pool, "product_images");

  const productsResult = await pool.query(
    `
      select distinct image as url
      from products
      where image like $1
    `,
    [`${sourcePrefix}%`],
  );

  let productImagesResult = { rows: [] };
  if (hasProductImages) {
    productImagesResult = await pool.query(
      `
        select distinct image_url as url
        from product_images
        where image_url like $1
      `,
      [`${sourcePrefix}%`],
    );
  }

  const uniqueUrls = new Set(
    [...productsResult.rows, ...productImagesResult.rows]
      .map((row) => (row.url ?? "").trim())
      .filter(Boolean),
  );

  const allUrls = [...uniqueUrls];
  const selectedUrls = limit > 0 ? allUrls.slice(0, limit) : allUrls;

  console.log(`Found ${allUrls.length} unique source URLs with prefix: ${sourcePrefix}`);
  if (localRoot) {
    console.log(`Using local source root: ${localRoot}`);
  }
  if (limit > 0) {
    console.log(`Applying limit=${limit}. Processing ${selectedUrls.length} URL(s).`);
  }
  if (dryRun) {
    console.log("Dry run enabled. No uploads or DB updates will happen.");
    for (const sample of selectedUrls.slice(0, 10)) {
      console.log(`- ${sample}`);
    }
    process.exit(0);
  }

  const replacements = new Map();
  const failures = [];
  let completed = 0;

  for (const sourceUrl of selectedUrls) {
    try {
      const { buffer, contentType } = localRoot
        ? await loadBufferFromLocal({ localRoot, sourceUrl, sourcePrefix })
        : await fetchBuffer(sourceUrl, { referer, cookie });
      const secureUrl = await uploadToCloudinary({
        cloudName,
        apiKey,
        apiSecret,
        folder,
        sourceUrl,
        imageBuffer: buffer,
        contentType,
      });
      replacements.set(sourceUrl, secureUrl);
      completed += 1;
      if (completed % 25 === 0) {
        console.log(`Uploaded ${completed}/${selectedUrls.length} images...`);
      }
    } catch (error) {
      failures.push({
        sourceUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`Failed: ${sourceUrl}`);
    }
  }

  if (replacements.size > 0) {
    await pool.query("begin");
    inTransaction = true;

    for (const [oldUrl, newUrl] of replacements.entries()) {
      await pool.query(
        `
          update products
          set image = $2
          where image = $1
        `,
        [oldUrl, newUrl],
      );
    }

    if (hasProductImages) {
      for (const [oldUrl, newUrl] of replacements.entries()) {
        await pool.query(
          `
            update product_images
            set image_url = $2
            where image_url = $1
          `,
          [oldUrl, newUrl],
        );
      }
    }

    await pool.query("commit");
    inTransaction = false;
  }

  const report = {
    sourcePrefix,
    folder,
    startedAt: new Date().toISOString(),
    totalDiscovered: allUrls.length,
    attempted: selectedUrls.length,
    uploaded: replacements.size,
    failed: failures.length,
    hasProductImagesTable: hasProductImages,
    failures,
    replacements: Object.fromEntries(replacements.entries()),
  };

  const reportName = `image-migration-report-${Date.now()}.json`;
  const reportPath = path.join(process.cwd(), "scripts", reportName);
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`Uploaded: ${replacements.size}`);
  console.log(`Failed: ${failures.length}`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  if (inTransaction) {
    await pool.query("rollback");
  }
  throw error;
} finally {
  await pool.end();
}
