import { getOrderById, updateOrder } from "@/lib/server/orders";
import { sendInitialOrderNotifications } from "@/lib/server/order-notifications";
import { verifyRazorpaySignature } from "@/lib/server/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      orderId?: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    };

    if (!payload.orderId || !payload.razorpayOrderId || !payload.razorpayPaymentId || !payload.razorpaySignature) {
      return Response.json({ error: "Missing payment verification details." }, { status: 400 });
    }

    const isValidSignature = verifyRazorpaySignature({
      razorpayOrderId: payload.razorpayOrderId,
      razorpayPaymentId: payload.razorpayPaymentId,
      razorpaySignature: payload.razorpaySignature,
    });

    if (!isValidSignature) {
      return Response.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const existingOrder = await getOrderById(payload.orderId);
    if (!existingOrder) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    const notesPrefix = existingOrder.notes ? `${existingOrder.notes}\n` : "";
    const updateResult = await updateOrder(payload.orderId, {
      status: "confirmed",
      paymentStatus: "paid",
      notes: `${notesPrefix}Razorpay Payment ID: ${payload.razorpayPaymentId}`,
    });

    if (!updateResult.ok) {
      return Response.json({ error: updateResult.message }, { status: 400 });
    }

    try {
      await sendInitialOrderNotifications(updateResult.value);
    } catch (error) {
      console.error("Post-payment notification failed", error);
    }

    return Response.json({ data: { order: updateResult.value } });
  } catch (error) {
    console.error("Payment confirmation failed", error);
    return Response.json({ error: "Unable to confirm payment." }, { status: 500 });
  }
}
