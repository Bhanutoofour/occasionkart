import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { bulkUpdateProductCategories, listCategorySummaries, listProducts } from "@/lib/server/catalog";

export const runtime = "nodejs";

export async function GET() {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [products, categories] = await Promise.all([listProducts(), listCategorySummaries(300)]);
  return NextResponse.json({ data: { products, categories } });
}

export async function PATCH(request: Request) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    productIds?: string[];
    category?: string;
    action?: "add" | "remove";
  };

  const result = await bulkUpdateProductCategories({
    productIds: payload.productIds ?? [],
    category: payload.category ?? "",
    action: payload.action === "remove" ? "remove" : "add",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  const [products, categories] = await Promise.all([listProducts(), listCategorySummaries(300)]);
  return NextResponse.json({
    data: {
      ...result.value,
      products,
      categories,
    },
  });
}
