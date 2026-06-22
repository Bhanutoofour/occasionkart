import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { getAdminSession } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";

import { ProfileForm } from "./profile-form";

export const metadata = createMetadata({
  title: "Profile | OccasionKart",
  description: "View and update your OccasionKart customer profile details.",
  keywords: ["OccasionKart profile", "customer profile"],
  noIndex: true,
});

export default async function AccountProfilePage() {
  const { session, isAdmin } = await getAdminSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (isAdmin) {
    redirect("/admin");
  }

  const phone =
    "phone" in session.user && session.user.phone ? String(session.user.phone) : "";

  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-5">
            <Link href="/account" className="text-[0.95rem] font-semibold text-[#ef7f41]">
              Back to account
            </Link>
          </div>
          <ProfileForm
            initialName={session.user.name}
            email={session.user.email}
            initialPhone={phone}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
