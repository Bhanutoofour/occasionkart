import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata = createMetadata({
  title: "Reset Password | OccasionKart",
  description: "Reset your OccasionKart customer account password.",
  keywords: ["OccasionKart reset password", "customer password reset"],
  noIndex: true,
});

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
    error?: string | string[];
    mode?: string | string[];
  }>;
};

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <ResetPasswordForm
          token={getSingleParam(params.token)}
          error={getSingleParam(params.error)}
          mode={getSingleParam(params.mode)}
        />
      </main>
      <SiteFooter />
    </>
  );
}
