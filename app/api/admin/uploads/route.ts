import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export async function POST(request: Request) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP, and GIF files are supported." },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
  const filename = `${Date.now()}-${randomUUID()}${extension}`;

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({
    data: {
      url: `/uploads/products/${filename}`,
    },
  });
}
