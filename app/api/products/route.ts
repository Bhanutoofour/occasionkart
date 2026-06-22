import type { NextRequest } from "next/server";

import { listProducts } from "@/lib/server/catalog";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit"));
  const products = await listProducts({
    category: searchParams.get("category"),
    query: searchParams.get("q"),
    sort: searchParams.get("sort"),
    limit: Number.isFinite(limit) ? limit : undefined,
  });

  return Response.json({
    data: products,
    meta: {
      total: products.length,
    },
  });
}
