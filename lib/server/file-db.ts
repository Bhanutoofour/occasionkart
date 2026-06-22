import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataRoot = path.join(process.cwd(), "data");

let writeQueue = Promise.resolve();

function getAbsolutePath(relativePath: string) {
  return path.join(dataRoot, relativePath);
}

async function ensureFile(relativePath: string, fallback: unknown) {
  const absolutePath = getAbsolutePath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });

  try {
    await readFile(absolutePath, "utf8");
  } catch {
    await writeFile(absolutePath, JSON.stringify(fallback, null, 2), "utf8");
  }
}

export async function readJsonFile<T>(relativePath: string, fallback: T): Promise<T> {
  await ensureFile(relativePath, fallback);
  const absolutePath = getAbsolutePath(relativePath);
  const raw = await readFile(absolutePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJsonFile<T>(relativePath: string, value: T): Promise<void> {
  await ensureFile(relativePath, value);
  const absolutePath = getAbsolutePath(relativePath);

  writeQueue = writeQueue.then(async () => {
    await writeFile(absolutePath, JSON.stringify(value, null, 2), "utf8");
  });

  await writeQueue;
}
