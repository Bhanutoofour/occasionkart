import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { getAdminSession } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";
import { listOrdersForUser } from "@/lib/server/orders";

export const metadata = createMetadata({
  title: "My Orders | OccasionKart",
  description:
    "Review your recent OccasionKart cake orders, totals, delivery details, and statuses.",
  keywords: ["OccasionKart orders", "track my cake order", "customer order history"],
  noIndex: true,
});

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export default async function AccountOrdersPage() {
  const { session, isAdmin } = await getAdminSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (isAdmin) {
    redirect("/admin");
  }

  const orders = await listOrdersForUser(session.user.id, 20);

  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <div className="mx-auto max-w-[980px]">
          <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[2rem] font-semibold text-black">My Orders</h1>
                <p className="mt-2 text-[1rem] leading-8 text-[#6c7396]">
                  Orders placed while signed in to your OccasionKart account appear
                  here.
                </p>
              </div>
              <Link
                href="/track-order"
                className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900"
              >
                Track by Order Number
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="mt-8 rounded-[18px] bg-[#fffaf6] p-6 text-[#6c7396]">
                No signed-in orders yet. Place your next order from checkout while
                logged in and it will appear here.
              </div>
            ) : (
              <div className="mt-8 space-y-5">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfb] p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#ef7f41]">
                          {order.orderNumber}
                        </p>
                        <h2 className="mt-2 text-[1.3rem] font-semibold text-stone-900">
                          {order.items
                            .map((item) => `${item.name} x ${item.quantity}`)
                            .join(", ")}
                        </h2>
                        <p className="mt-2 text-[0.95rem] text-[#6c7396]">
                          Delivery date: {order.delivery.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="rounded-full bg-[#fff3e8] px-4 py-2 text-[0.9rem] font-semibold capitalize text-[#a85b22]">
                          {formatStatus(order.status)}
                        </p>
                        <p className="mt-3 text-[1.2rem] font-semibold text-stone-900">
                          Rs. {order.pricing.total}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
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
                          Address
                        </p>
                        <p className="mt-2 text-[0.98rem] text-stone-900">
                          {order.delivery.address}
                        </p>
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
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
