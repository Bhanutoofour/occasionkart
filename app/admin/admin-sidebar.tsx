"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminLink = {
  href?: string;
  label: string;
  badgeCount?: number;
  comingSoon?: boolean;
};

export type AdminSidebarSection = {
  title: string;
  links: AdminLink[];
};

function isActiveLink(pathname: string, href: string | undefined) {
  if (!href) {
    return false;
  }

  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  sections,
  userEmail,
}: {
  sections: AdminSidebarSection[];
  userEmail?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="h-fit min-w-0 rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#1f2731] p-4 text-white shadow-[0_16px_36px_rgba(0,0,0,0.2)] xl:sticky xl:top-[88px]">
      <p className="px-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#9cb0c3]">
        Admin Panel
      </p>

      <nav className="mt-3 space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8ea1b3]">
              {section.title}
            </p>
            <div className="mt-1.5 space-y-1.5">
              {section.links.map((link) => {
                const active = isActiveLink(pathname, link.href);
                const hasAlert = (link.badgeCount ?? 0) > 0;
                const baseClass = `flex items-center justify-between rounded-[12px] px-3 py-2.5 text-[0.98rem] font-medium transition ${
                  active
                    ? "bg-[#263443] text-white"
                    : hasAlert
                      ? "text-[#ffd3d3] hover:bg-[#3a2830] hover:text-white"
                      : "text-[#d9e5f0] hover:bg-[#273541] hover:text-white"
                }`;

                if (link.href && !link.comingSoon) {
                  return (
                    <Link key={`${section.title}-${link.label}`} href={link.href} className={baseClass}>
                      <span>{link.label}</span>
                      {typeof link.badgeCount === "number" && link.badgeCount > 0 ? (
                        <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#e14c4c] px-2 py-0.5 text-[0.78rem] font-semibold leading-none text-white">
                          {link.badgeCount}
                        </span>
                      ) : null}
                    </Link>
                  );
                }

                return (
                  <div
                    key={`${section.title}-${link.label}`}
                    className="flex items-center justify-between rounded-[12px] px-3 py-2.5 text-[0.98rem] font-medium text-[#9db0c2]"
                    aria-disabled="true"
                  >
                    <span>{link.label}</span>
                    <span className="rounded-full border border-[rgba(255,255,255,0.2)] px-2 py-0.5 text-[0.68rem] uppercase tracking-[0.08em] text-[#c9d7e4]">
                      Soon
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-5 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5">
        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#98adbf]">Signed in</p>
        <p className="mt-1 truncate text-[0.88rem] text-[#f2f6fb]">{userEmail ?? "Admin user"}</p>
      </div>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          className="w-full rounded-full bg-[#ef7f41] px-3 py-2 text-[0.82rem] font-semibold text-white"
        >
          + New Order
        </button>
        <button
          type="button"
          className="w-full rounded-full border border-[rgba(255,255,255,0.18)] px-3 py-2 text-[0.82rem] font-semibold text-[#dce8f3]"
        >
          + Restock Item
        </button>
        <button
          type="button"
          className="w-full rounded-full border border-[rgba(255,255,255,0.18)] px-3 py-2 text-[0.82rem] font-semibold text-[#dce8f3]"
        >
          + Create Promotion
        </button>
      </div>
    </aside>
  );
}
