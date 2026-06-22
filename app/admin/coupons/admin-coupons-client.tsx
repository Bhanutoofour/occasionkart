"use client";

import { useState } from "react";

import type { CouponDefinition } from "@/lib/coupons";

type AdminCouponsClientProps = {
  initialCoupons: CouponDefinition[];
};

const initialForm = {
  code: "",
  percentageOff: "10",
  minSubtotal: "",
  maxRedemptions: "",
  expiresAt: "",
};

export function AdminCouponsClient({ initialCoupons }: AdminCouponsClientProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateForm = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const createCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: form.code,
          percentageOff: Number(form.percentageOff),
          active: true,
          minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : null,
          maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const payload = (await response.json()) as {
        data?: CouponDefinition;
        error?: string;
      };

      if (!response.ok || !payload.data) {
        setError(payload.error ?? "Unable to create coupon.");
        return;
      }

      setCoupons((current) => [
        payload.data as CouponDefinition,
        ...current.filter((coupon) => coupon.code !== payload.data?.code),
      ]);
      setForm(initialForm);
      setMessage(`Coupon ${payload.data.code} saved.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <form
        onSubmit={createCoupon}
        className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
      >
        <h2 className="text-[1.5rem] font-semibold text-black">Create Coupon</h2>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="coupon-code">
              Code
            </label>
            <input
              id="coupon-code"
              required
              value={form.code}
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3 uppercase"
              onChange={(event) => updateForm("code", event.target.value.toUpperCase())}
              placeholder="BHANU99"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-[0.9rem] font-semibold text-stone-900"
                htmlFor="percentage-off"
              >
                Percentage Off
              </label>
              <input
                id="percentage-off"
                required
                type="number"
                min={1}
                max={99}
                value={form.percentageOff}
                className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateForm("percentageOff", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-[0.9rem] font-semibold text-stone-900"
                htmlFor="max-redemptions"
              >
                Max Uses
              </label>
              <input
                id="max-redemptions"
                type="number"
                min={1}
                value={form.maxRedemptions}
                className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateForm("maxRedemptions", event.target.value)}
                placeholder="Leave blank for unlimited"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-[0.9rem] font-semibold text-stone-900"
                htmlFor="min-subtotal"
              >
                Min Subtotal
              </label>
              <input
                id="min-subtotal"
                type="number"
                min={0}
                value={form.minSubtotal}
                className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateForm("minSubtotal", event.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="expires-at">
                Expires At
              </label>
              <input
                id="expires-at"
                type="datetime-local"
                value={form.expiresAt}
                className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateForm("expiresAt", event.target.value)}
              />
            </div>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 rounded-[12px] bg-[#f3fff2] px-4 py-3 text-[0.95rem] text-[#2f8f2f]">
            {message}
          </p>
        ) : null}

        <button
          disabled={isSaving}
          className="mt-6 w-full rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save Coupon"}
        </button>
      </form>

      <section className="min-w-0 rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
        <h2 className="text-[1.5rem] font-semibold text-black">Coupons</h2>
        <div className="mt-5 max-w-full overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[0.92rem]">
            <thead className="text-[#6c7396]">
              <tr className="border-b border-[rgba(0,0,0,0.1)]">
                <th className="py-3 pr-4 font-semibold">Code</th>
                <th className="py-3 pr-4 font-semibold">Off</th>
                <th className="py-3 pr-4 font-semibold">Uses</th>
                <th className="py-3 pr-4 font-semibold">Min</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 font-semibold">Expires</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.code} className="border-b border-[rgba(0,0,0,0.06)]">
                  <td className="py-4 pr-4 font-semibold text-stone-950">{coupon.code}</td>
                  <td className="py-4 pr-4">{coupon.percentageOff}%</td>
                  <td className="py-4 pr-4">
                    {coupon.redemptionCount ?? 0}
                    {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : " / unlimited"}
                  </td>
                  <td className="py-4 pr-4">
                    {coupon.minSubtotal ? `Rs. ${coupon.minSubtotal}` : "-"}
                  </td>
                  <td className="py-4 pr-4">
                    {coupon.active ? (
                      <span className="rounded-full bg-[#f3fff2] px-3 py-1 text-[#2f8f2f]">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#fff3f0] px-3 py-1 text-[#b93815]">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleString("en-IN") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
