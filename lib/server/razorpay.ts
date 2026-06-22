import { createHmac } from "node:crypto";

type CreateRazorpayOrderInput = {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
};

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
};

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET.");
  }

  return {
    keyId,
    keySecret,
  };
}

export function getRazorpayPublicConfig() {
  const { keyId } = getRazorpayCredentials();
  return { keyId };
}

export async function createRazorpayOrder({
  amountPaise,
  currency = "INR",
  receipt,
  notes,
}: CreateRazorpayOrderInput): Promise<RazorpayOrderResponse> {
  const { keyId, keySecret } = getRazorpayCredentials();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency,
      receipt,
      notes: notes ?? {},
    }),
  });

  const payload = (await response.json()) as {
    id?: string;
    amount?: number;
    currency?: string;
    error?: { description?: string };
  };

  if (!response.ok || !payload.id || !payload.amount || !payload.currency) {
    throw new Error(payload.error?.description ?? "Unable to create Razorpay order.");
  }

  return {
    id: payload.id,
    amount: payload.amount,
    currency: payload.currency,
  };
}

export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { keySecret } = getRazorpayCredentials();
  const digest = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return digest === razorpaySignature;
}

