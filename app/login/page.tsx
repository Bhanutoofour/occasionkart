import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

import { LoginForm } from "./login-form";

export const metadata = createMetadata({
  title: "Login | OccasionKart",
  description:
    "Sign in to your OccasionKart account to manage cake orders, saved details, and order tracking.",
  keywords: ["OccasionKart login", "cake order login"],
  noIndex: true,
});

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <LoginForm />
      </main>
      <SiteFooter />
    </>
  );
}
