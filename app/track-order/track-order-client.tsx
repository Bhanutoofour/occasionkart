"use client";

import { useState } from "react";

import { InquiryForm } from "@/components/store/inquiry-form";

type TrackOrderResult = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  delivery: {
    date: string;
    address: string;
    cakeMessage?: string;
  };
  pricing: {
    total: number;
  };
  items: Array<{
    name: string;
    quantity: number;
  }>;
};

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export function TrackOrderClient() {
  const [order, setOrder] = useState<TrackOrderResult | null>(null);

  const handleTrackOrder = async (values: Record<string, string>) => {
    const response = await fetch(
      `/api/orders/${encodeURIComponent(values.orderId)}?phone=${encodeURIComponent(values.phone)}`,
    );
    const payload = (await response.json()) as {
      data?: TrackOrderResult;
      error?: string;
    };

    if (!response.ok || !payload.data) {
      throw new Error(payload.error ?? "Unable to find an order with those details.");
    }

    setOrder(payload.data);
  };

  return (
    <>
      <InquiryForm
        emailTo="support@occasionkart.com"
        emailSubject="Track My Order"
        whatsappNumber="+91 9059058058"
        whatsappIntro="Hello OccasionKart, I would like to track my order."
        primaryLabel="Track Order"
        secondaryLabel="Track on WhatsApp"
        onSubmit={handleTrackOrder}
        fields={[
          {
            name: "orderId",
            label: "Order ID",
            placeholder: "Enter your order ID",
            required: true,
          },
          {
            name: "phone",
            label: "Phone Number",
            placeholder: "Enter your phone number",
            type: "tel",
            required: true,
          },
        ]}
      />

      {order ? (
        <div className="mt-6 rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] p-6">
          <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#ef7f41]">
            {order.orderNumber}
          </p>
          <h2 className="mt-3 text-[1.5rem] font-semibold text-stone-900 capitalize">
            {formatStatus(order.status)}
          </h2>
          <p className="mt-2 text-[0.98rem] leading-7 text-[#6c7396]">
            {order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                Delivery Date
              </p>
              <p className="mt-2 text-[0.98rem] text-stone-900">{order.delivery.date}</p>
            </div>
            <div>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                Payment
              </p>
              <p className="mt-2 text-[0.98rem] capitalize text-stone-900">
                {formatStatus(order.paymentStatus)}
              </p>
            </div>
            <div>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                Total
              </p>
              <p className="mt-2 text-[0.98rem] text-stone-900">Rs. {order.pricing.total}</p>
            </div>
            <div>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                Ordered
              </p>
              <p className="mt-2 text-[0.98rem] text-stone-900">
                {new Date(order.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
