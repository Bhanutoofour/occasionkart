import { headers } from "next/headers";
import type { NextRequest } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { sendInitialOrderNotifications } from "@/lib/server/order-notifications";
import { createOrder, listOrders } from "@/lib/server/orders";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get("limit"));
  const orders = await listOrders({
    status: searchParams.get("status"),
    paymentStatus: searchParams.get("paymentStatus"),
    limit: Number.isFinite(limit) ? limit : undefined,
  });

  return Response.json({
    data: orders,
    meta: {
      total: orders.length,
    },
  });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const result = await createOrder({
    ...(payload as Record<string, unknown>),
    userId: session?.user?.id,
  });

  if (!result.ok) {
    return Response.json({ error: result.message }, { status: 400 });
  }

  await sendInitialOrderNotifications(result.value);

  return Response.json({ data: result.value }, { status: 201 });
}
