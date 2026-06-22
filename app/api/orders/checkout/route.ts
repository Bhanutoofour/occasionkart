import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { createOrder } from "@/lib/server/orders";
import { createRazorpayOrder, getRazorpayPublicConfig } from "@/lib/server/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const orderResult = await createOrder({
      ...(payload as Record<string, unknown>),
      userId: session?.user?.id,
      paymentStatus: "pending",
    });

    if (!orderResult.ok) {
      return Response.json({ error: orderResult.message }, { status: 400 });
    }

    const order = orderResult.value;

    const razorpayOrder = await createRazorpayOrder({
      amountPaise: order.pricing.total * 100,
      receipt: order.orderNumber,
      notes: {
        occasionkartOrderId: order.id,
        occasionkartOrderNumber: order.orderNumber,
      },
    });

    const { keyId } = getRazorpayPublicConfig();

    return Response.json(
      {
        data: {
          order,
          razorpay: {
            key: keyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: razorpayOrder.id,
            merchantName: "OccasionKart",
            description: `Order ${order.orderNumber}`,
            prefill: {
              name: order.customer.fullName,
              email: order.customer.email,
              contact: order.customer.phone,
            },
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Checkout initialization failed", error);
    return Response.json({ error: "Unable to initialize checkout payment." }, { status: 500 });
  }
}
