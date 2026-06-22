import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { updateProduct } from "@/lib/server/catalog";

export const runtime = "nodejs";

type ProductRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: ProductRouteContext) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payload = await request.json();
  const result = await updateProduct(id, payload);

  if (!result.ok) {
    const status = result.message === "product not found" ? 404 : 400;
    return NextResponse.json({ error: result.message }, { status });
  }

  return NextResponse.json({ data: result.value });
}
