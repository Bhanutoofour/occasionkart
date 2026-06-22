import { resolveCouponDiscountForCheckout } from "@/lib/server/coupons";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      couponCode?: string;
      subtotal?: number;
    };

    const resolution = await resolveCouponDiscountForCheckout({
      couponCode: payload.couponCode,
      subtotal: Number(payload.subtotal ?? 0),
    });

    return Response.json({ data: resolution });
  } catch (error) {
    console.error("Coupon resolution failed", error);
    return Response.json({ error: "Unable to validate coupon." }, { status: 500 });
  }
}
