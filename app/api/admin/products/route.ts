import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { createProduct, listProducts } from "@/lib/server/catalog";

export const runtime = "nodejs";

export async function GET() {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await listProducts();
  return NextResponse.json({ data: products });
}

export async function POST(request: Request) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const result = await createProduct(payload);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({ data: result.value }, { status: 201 });
}
