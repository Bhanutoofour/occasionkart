import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Privacy Policy | OccasionKart",
  description:
    "Read OccasionKart's privacy policy for information on customer data, order details, payment handling, and communication preferences.",
  keywords: ["privacy policy OccasionKart", "cake order privacy policy"],
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-10">
        <div className="mx-auto max-w-[1100px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <h1 className="text-[2.2rem] font-semibold text-black">Privacy Policy</h1>
          <p className="mt-4 text-[1rem] leading-8 text-[#6c7396]">
            Occasionkart respects your privacy. We collect only the information
            necessary to process orders and improve your shopping experience.
          </p>

          <div className="mt-6 space-y-5 text-[1rem] leading-8 text-[#6c7396]">
            <p>
              1. We collect customer details such as name, phone number, and
              delivery address for order fulfillment.
            </p>
            <p>
              2. Payment details are handled securely through third-party
              gateways and are not stored on our servers.
            </p>
            <p>
              3. We may send order updates, offers, and service notifications
              via email or WhatsApp. You can opt out at any time.
            </p>
            <p>
              4. We do not sell or share your personal information with third
              parties outside of logistics and payment providers.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
