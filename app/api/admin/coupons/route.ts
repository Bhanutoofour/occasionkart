import { getAdminSession } from "@/lib/admin-auth";
import { createCoupon, listCoupons } from "@/lib/server/coupons";

export const runtime = "nodejs";

export async function GET() {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const coupons = await listCoupons();
  return Response.json({ data: coupons });
}

export async function POST(request: Request) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const payload = await request.json();
  const result = await createCoupon(payload);

  if (!result.ok) {
    return Response.json({ error: result.message }, { status: 400 });
  }

  return Response.json({ data: result.value }, { status: 201 });
}
