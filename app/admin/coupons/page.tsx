import { createMetadata } from "@/lib/seo";
import { listCoupons } from "@/lib/server/coupons";

import { AdminCouponsClient } from "./admin-coupons-client";

export const metadata = createMetadata({
  title: "Admin Coupons | OccasionKart",
  description: "Create and review OccasionKart checkout coupons.",
  noIndex: true,
});

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[2rem] font-semibold text-black">Coupon Manager</h2>
        <p className="mt-2 max-w-[68ch] text-[1rem] leading-8 text-[#6c7396]">
          Create checkout coupons, cap usage, and review redemption counts.
        </p>
      </div>

      <AdminCouponsClient initialCoupons={coupons} />
    </div>
  );
}
