import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isCustomizationOrder } from "@/lib/admin-ops";
import { getAdminSession } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";
import { getOrderDashboardStats, listOrders, getAbandonedCartCount } from "@/lib/server/orders";
import { AdminSignOutButton } from "./admin-sign-out-button";
import { AdminSidebar, type AdminSidebarSection } from "./admin-sidebar";

export const metadata = createMetadata({
  title: "Admin | OccasionKart",
  description: "Restricted admin workspace for OccasionKart operations.",
  noIndex: true,
});

const adminSections: AdminSidebarSection[] = [
  {
    title: "Core",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/abandoned-carts", label: "Abandoned Carts" },
      { href: "/admin/products", label: "Products" },
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/categories", label: "Content" },
      { href: "/admin/customization", label: "Customization" },
      { href: "/admin/delivery", label: "Delivery" },
      { href: "/admin/coupons", label: "Coupons" },
    ],
  },
  {
    title: "Growth",
    links: [
      { label: "Marketing", comingSoon: true },
    ],
  },
  {
    title: "Content Stack",
    links: [
      { label: "Metaobjects", comingSoon: true },
      { label: "Files", comingSoon: true },
      { label: "Menus", comingSoon: true },
      { label: "Blog posts", comingSoon: true },
    ],
  },
  {
    title: "Business",
    links: [
      { label: "Markets", comingSoon: true },
      { href: "/admin/finance", label: "Finance" },
      { href: "/admin/analytics", label: "Analytics" },
    ],
  },
  {
    title: "Growth Actions",
    links: [{ href: "/admin/marketing", label: "Marketing" }],
  },
];

function AdminShellHeader({ userEmail }: { userEmail?: string }) {
  return (
    <header className="sticky top-0 z-[200] border-b border-[#2e3844] bg-[#17202a] text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-white"
            aria-label="Admin dashboard"
          >
            <Image
              src="/brand/occasionkart-badge.png"
              alt="OccasionKart"
              width={34}
              height={34}
              priority
              className="h-9 w-9 object-contain"
            />
          </Link>
          <div className="min-w-0">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9cb0c3]">
              Admin
            </p>
            <p className="truncate text-[1.05rem] font-semibold">OccasionKart Control Panel</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className="hidden max-w-[260px] truncate text-[0.88rem] text-[#c6d3df] sm:block">
            {userEmail ?? "Admin user"}
          </p>
          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-[0.88rem] font-semibold text-[#1f2731] transition hover:bg-[#f3f6f9]"
          >
            View Store
          </Link>
          <AdminSignOutButton />
        </div>
      </div>
    </header>
  );
}

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { session, isAdmin } = await getAdminSession();

  if (!session?.user) {
    redirect("/admin-login");
  }

  const [orderStats, recentOrders, abandonedCartCount] = isAdmin
    ? await Promise.all([
        getOrderDashboardStats(),
        listOrders({ paymentStatus: "paid", limit: 400 }),
        getAbandonedCartCount(),
      ])
    : [null, [], 0];
  const pendingCustomizationCount = recentOrders.filter(
    (order) => isCustomizationOrder(order) && order.status === "pending",
  ).length;
  const activeDeliveryCount = recentOrders.filter(
    (order) => order.status === "out_for_delivery",
  ).length;
  const sidebarSections = adminSections.map((section) => ({
    ...section,
    links: section.links.map((link) =>
      link.href === "/admin/orders"
        ? { ...link, badgeCount: orderStats?.pendingOrders ?? 0 }
        : link.href === "/admin/abandoned-carts"
          ? { ...link, badgeCount: abandonedCartCount }
          : link.href === "/admin/customization"
            ? { ...link, badgeCount: pendingCustomizationCount }
            : link.href === "/admin/delivery"
              ? { ...link, badgeCount: activeDeliveryCount }
              : link,
    ),
  }));

  return (
    <>
      <AdminShellHeader userEmail={session.user.email} />
      <main className="min-w-0 overflow-x-clip bg-[#f6f7fb] px-4 py-6 sm:px-6 lg:px-8">
        {!isAdmin ? (
          <div className="mx-auto max-w-[760px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
            <h1 className="text-[2rem] font-semibold text-black">Admin Access Required</h1>
            <p className="mt-3 text-[1rem] leading-8 text-[#6c7396]">
              This admin area is restricted to approved accounts. Add your email to
              `ADMIN_EMAILS` in production to grant access.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin-login"
                className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white"
              >
                Admin Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[1600px] min-w-0">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Admin</p>
                <h1 className="mt-3 text-[clamp(2rem,4vw,2.6rem)] font-semibold leading-tight text-black">
                  OccasionKart Control Panel
                </h1>
                <p className="mt-3 max-w-[72ch] text-[1rem] leading-8 text-[#6c7396]">
                  Manage live orders, products, customers, and categories from one
                  workspace.
                </p>
              </div>
            </div>

            <div className="grid min-w-0 gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
              <AdminSidebar sections={sidebarSections} userEmail={session.user.email} />

              <section className="min-w-0">{children}</section>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
