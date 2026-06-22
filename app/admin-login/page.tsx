import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { getAdminSession } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";

import { AdminLoginForm } from "./admin-login-form";

export const metadata = createMetadata({
  title: "Admin Login | OccasionKart",
  description: "Restricted OccasionKart admin login.",
  noIndex: true,
});

export default async function AdminLoginPage() {
  const { isAdmin } = await getAdminSession();

  if (isAdmin) {
    redirect("/admin");
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <AdminLoginForm />
      </main>
      <SiteFooter />
    </>
  );
}
