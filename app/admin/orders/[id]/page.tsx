import Link from "next/link";
import { notFound } from "next/navigation";

import { createMetadata } from "@/lib/seo";
import { getOrderById } from "@/lib/server/orders";

import { AdminOrderDetailClient } from "./admin-order-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return createMetadata({
    title: `Admin Order ${id} | OccasionKart`,
    description: "Manage customer order status, notes, payment state, and delivery details.",
    noIndex: true,
  });
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">{order.orderNumber}</p>
          <h2 className="mt-3 text-[2rem] font-semibold text-black">
            {order.customer.fullName}
          </h2>
          <p className="mt-2 text-[1rem] leading-8 text-[#6c7396]">
            Review items, customer details, delivery address, and fulfillment status.
          </p>
        </div>
        <Link
          href={order.paymentStatus === "paid" ? "/admin/orders" : "/admin/abandoned-carts"}
          className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900"
        >
          {order.paymentStatus === "paid" ? "Back to Orders" : "Back to Abandoned Carts"}
        </Link>
      </div>

      {order.paymentStatus !== "paid" ? (
        <div className="rounded-[16px] border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-[0.95rem] text-[#9f1239]">
          This checkout was not paid via Razorpay. It appears in{" "}
          <Link href="/admin/abandoned-carts" className="font-semibold underline">
            Abandoned Carts
          </Link>
          , not in the main Orders list.
        </div>
      ) : null}

      <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-[1.35rem] font-semibold text-black">Items</h3>
            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div
                  key={`${item.slug}-${item.quantity}`}
                  className="rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfb] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[1rem] font-semibold text-stone-900">{item.name}</p>
                      <p className="mt-1 text-[0.94rem] text-[#6c7396]">
                        {item.quantity} x Rs. {item.unitPrice}
                      </p>
                    </div>
                    <p className="text-[1rem] font-semibold text-stone-900">
                      Rs. {item.lineTotal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AdminOrderDetailClient order={order} />
        </div>

        <div className="min-w-0 space-y-6">
          <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-[1.35rem] font-semibold text-black">Customer</h3>
            <div className="mt-5 space-y-3 text-[0.98rem] text-stone-900">
              <p>{order.customer.fullName}</p>
              <p>{order.customer.phone}</p>
              <p>{order.customer.email ?? "No email provided"}</p>
            </div>
          </div>

          <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-[1.35rem] font-semibold text-black">Delivery</h3>
            <div className="mt-5 space-y-3 text-[0.98rem] text-stone-900">
              <p>Date: {order.delivery.date}</p>
              <p>Slot: {order.delivery.slot ?? "Not provided"}</p>
              <p>Pincode: {order.delivery.pincode ?? "Not provided"}</p>
              <p>Address: {order.delivery.address}</p>
              <p>City: {order.delivery.city}</p>
              <p>Message: {order.delivery.cakeMessage ?? "No cake message"}</p>
            </div>
          </div>

          <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-[1.35rem] font-semibold text-black">Summary</h3>
            <div className="mt-5 space-y-3 text-[0.98rem] text-stone-900">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {order.pricing.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>Rs. {order.pricing.deliveryFee}</span>
              </div>
              <div className="flex justify-between border-t border-[rgba(0,0,0,0.08)] pt-3 font-semibold">
                <span>Total</span>
                <span>Rs. {order.pricing.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
