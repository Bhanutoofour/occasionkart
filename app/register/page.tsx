import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

import { RegisterForm } from "./register-form";

export const metadata = createMetadata({
  title: "Create Account | OccasionKart",
  description:
    "Create your OccasionKart account to manage cake orders, saved delivery details, and customer information.",
  keywords: ["OccasionKart sign up", "customer account registration"],
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <RegisterForm />
      </main>
      <SiteFooter />
    </>
  );
}
