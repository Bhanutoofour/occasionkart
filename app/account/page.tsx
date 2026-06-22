import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { getAdminSession } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";
import { listOrdersForUser } from "@/lib/server/orders";
import type { Order } from "@/lib/store-schema";

import { SignOutButton } from "./sign-out-button";

export const metadata = createMetadata({
  title: "My Account | OccasionKart",
  description:
    "View your OccasionKart account details and stay ready for upcoming cake orders.",
  keywords: ["OccasionKart account", "customer profile", "cake order account"],
  noIndex: true,
});

function getSavedDeliveryAddresses(orders: Order[]) {
  const addressMap = new Map<string, Order["delivery"]>();

  for (const order of orders) {
    const key = [
      order.delivery.address,
      order.delivery.city,
      order.delivery.pincode,
    ]
      .filter(Boolean)
      .join("|")
      .toLowerCase();

    if (key && !addressMap.has(key)) {
      addressMap.set(key, order.delivery);
    }
  }

  return Array.from(addressMap.values()).slice(0, 3);
}

export default async function AccountPage() {
  const { session, isAdmin } = await getAdminSession();

  if (isAdmin) {
    redirect("/admin");
  }

  const recentOrders = session?.user?.id ? await listOrdersForUser(session.user.id, 10) : [];
  const savedDeliveryAddresses = getSavedDeliveryAddresses(recentOrders);

  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <div className="mx-auto max-w-[760px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <h1 className="text-[2rem] font-semibold text-black">My Account</h1>

          {session?.user ? (
            <>
              <p className="mt-2 text-[1rem] text-[#6c7396]">
                Your customer account is limited to your profile, orders, and saved
                billing and shipping details.
              </p>

              <div className="mt-6 grid gap-4 rounded-[18px] bg-[#fffaf6] p-5 sm:grid-cols-2">
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Name
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                    {session.user.name}
                  </p>
                </div>
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Email
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                    {session.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Phone
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                    {"phone" in session.user && session.user.phone
                      ? String(session.user.phone)
                      : "Add during next profile update"}
                  </p>
                </div>
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Session
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                    Active
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Link
                  href="/account/profile"
                  className="rounded-[18px] border border-[rgba(0,0,0,0.1)] bg-white p-5 text-stone-900 transition hover:border-[#ef7f41]"
                >
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Profile
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold">Account details</p>
                </Link>
                <Link
                  href="/account/orders"
                  className="rounded-[18px] border border-[rgba(0,0,0,0.1)] bg-white p-5 text-stone-900 transition hover:border-[#ef7f41]"
                >
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Orders
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold">
                    {recentOrders.length} recent order{recentOrders.length === 1 ? "" : "s"}
                  </p>
                </Link>
                <Link
                  href="/cakes"
                  className="rounded-[18px] border border-[rgba(0,0,0,0.1)] bg-white p-5 text-stone-900 transition hover:border-[#ef7f41]"
                >
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Shop
                  </p>
                  <p className="mt-2 text-[1rem] font-semibold">Continue shopping</p>
                </Link>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <section className="rounded-[18px] border border-[rgba(0,0,0,0.1)] bg-[#fffdfb] p-5">
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Shipping Addresses
                  </p>
                  {savedDeliveryAddresses.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {savedDeliveryAddresses.map((address) => (
                        <div
                          key={`${address.address}-${address.pincode ?? ""}`}
                          className="rounded-[14px] bg-white p-4 text-[0.95rem] text-stone-800"
                        >
                          <p className="font-semibold text-stone-950">{address.address}</p>
                          <p className="mt-1 text-[#6c7396]">
                            {address.city}
                            {address.pincode ? ` - ${address.pincode}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-[0.95rem] leading-7 text-[#6c7396]">
                      Shipping addresses from your signed-in orders will appear here.
                    </p>
                  )}
                </section>

                <section className="rounded-[18px] border border-[rgba(0,0,0,0.1)] bg-[#fffdfb] p-5">
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                    Billing Addresses
                  </p>
                  {savedDeliveryAddresses.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {savedDeliveryAddresses.map((address) => (
                        <div
                          key={`billing-${address.address}-${address.pincode ?? ""}`}
                          className="rounded-[14px] bg-white p-4 text-[0.95rem] text-stone-800"
                        >
                          <p className="font-semibold text-stone-950">{address.address}</p>
                          <p className="mt-1 text-[#6c7396]">
                            {address.city}
                            {address.pincode ? ` - ${address.pincode}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-[0.95rem] leading-7 text-[#6c7396]">
                      Billing addresses from your signed-in orders will appear here.
                    </p>
                  )}
                </section>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/cakes"
                  className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white"
                >
                  Continue Shopping
                </Link>
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-[1rem] text-[#6c7396]">
                Sign in to connect future orders, saved delivery details, and customer
                history to your account.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
