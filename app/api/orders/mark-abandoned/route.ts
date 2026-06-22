import { markOrderPaymentAbandoned } from "@/lib/server/orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { orderId?: string };

    if (!payload.orderId?.trim()) {
      return Response.json({ error: "orderId is required." }, { status: 400 });
    }

    const updated = await markOrderPaymentAbandoned(payload.orderId.trim());

    return Response.json({ data: { updated } });
  } catch (error) {
    console.error("Mark abandoned payment failed", error);
    return Response.json({ error: "Unable to mark order as abandoned." }, { status: 500 });
  }
}
