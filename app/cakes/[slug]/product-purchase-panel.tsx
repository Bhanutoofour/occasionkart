"use client";

import { useState } from "react";

import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { SameDayDeliveryPanel } from "@/components/store/same-day-delivery-panel";
import { resolveVariantPricing } from "@/lib/product-variants";
import { getShippingQuote } from "@/lib/shipping-rules";
import type { Product } from "@/lib/store-schema";

const priceFormatter = new Intl.NumberFormat("en-IN");

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [weightId, setWeightId] = useState(product.weightOptions[0]?.id ?? "");
  const [flavorId, setFlavorId] = useState(product.flavorOptions[0]?.id ?? "");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [pincodeFeedback, setPincodeFeedback] = useState("");
  const [isPincodeValid, setIsPincodeValid] = useState(false);
  const [customPhotoName, setCustomPhotoName] = useState("");

  const isPhotoCake = /photo/i.test(product.name) || product.categories.some((category) => /photo/i.test(category));

  const checkPincode = () => {
    const quote = getShippingQuote({ pincode: deliveryPincode });
    if (!quote.deliverable) {
      setPincodeFeedback(quote.message);
      setIsPincodeValid(false);
      return;
    }

    setPincodeFeedback(
      quote.baseFee === 0
        ? "Yeah! We deliver to this location with free shipping."
        : `Yeah! We deliver to this location. Shipping starts at Rs. ${quote.baseFee}.`,
    );
    setIsPincodeValid(true);
  };

  if (product.weightOptions.length === 0 || product.flavorOptions.length === 0) {
    return (
      <>
        <SameDayDeliveryPanel compact />

        <div className="grid gap-4 py-5 sm:grid-cols-2">
          <div className="rounded-[24px] bg-[var(--cream-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Serving</p>
            <p className="mt-2 text-lg font-semibold text-[var(--brand-brown)]">
              {product.serves}
            </p>
          </div>
          <div className="rounded-[24px] bg-[var(--cream-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Included</p>
            <p className="mt-2 text-lg font-semibold text-[var(--brand-brown)]">
              Custom plaque
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {product.highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-[20px] border border-[var(--line)] px-4 py-3 text-sm font-medium text-stone-700"
            >
              {highlight}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="inline-flex items-center rounded-full border border-[rgba(111,29,42,0.14)] bg-[#fff7f8] px-5 py-3 text-[var(--brand-maroon)]">
            <span className="text-[0.95rem] font-semibold">Rs</span>
            <span className="ml-1.5 text-[1.45rem] font-bold">
              {priceFormatter.format(product.price)}/-
            </span>
          </div>
          <AddToCartButton
            slug={product.slug}
            name={product.name}
            price={product.price}
            image={product.image}
            customPhotoName={customPhotoName || undefined}
          />
        </div>

        {isPhotoCake ? (
          <div className="mt-4 rounded-[18px] border border-[rgba(0,0,0,0.1)] bg-white p-4">
            <p className="text-[0.9rem] font-semibold text-stone-900">Upload a photo to print on your cake</p>
            <input
              type="file"
              accept="image/*"
              className="mt-3 w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm"
              onChange={(event) => setCustomPhotoName(event.target.files?.[0]?.name ?? "")}
            />
            {customPhotoName ? (
              <p className="mt-2 text-[0.84rem] font-medium text-[#2f8f2f]">Selected: {customPhotoName}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 rounded-[20px] border border-[var(--line)] bg-[#fffdf9] p-4">
          <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#9c7a67]">
            Check Delivery Pincode
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={deliveryPincode}
              onChange={(event) => setDeliveryPincode(event.target.value)}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              inputMode="numeric"
              className="min-w-[190px] flex-1 rounded-[14px] border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-stone-700"
            />
            <button
              type="button"
              onClick={checkPincode}
              className="rounded-full bg-[#ef7f41] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Check
            </button>
          </div>
          {pincodeFeedback ? (
            <p
              className={`mt-3 text-[0.9rem] font-semibold ${
                isPincodeValid ? "text-[#2f8f2f]" : "text-[#b53131]"
              }`}
            >
              {pincodeFeedback}
            </p>
          ) : null}
        </div>
      </>
    );
  }

  const { selectedWeight, selectedFlavor, unitPrice } = resolveVariantPricing(
    product,
    weightId,
    flavorId,
  );

  return (
    <>
      <SameDayDeliveryPanel compact />

      <div className="grid gap-4 py-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[rgba(111,29,42,0.08)] bg-[linear-gradient(180deg,#fff8f3_0%,#fff2e8_100%)] p-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#9c7a67]">
            Weight
          </p>
          <select
            value={selectedWeight?.id ?? ""}
            className="mt-3 w-full rounded-[18px] border border-[rgba(111,29,42,0.18)] bg-white px-4 py-4 text-[1rem] font-semibold text-[var(--brand-brown)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
            onChange={(event) => setWeightId(event.target.value)}
          >
            {product.weightOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} - Rs. {option.price}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-[24px] border border-[rgba(111,29,42,0.08)] bg-[linear-gradient(180deg,#fff8f3_0%,#fff2e8_100%)] p-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#9c7a67]">
            Flavor
          </p>
          <select
            value={selectedFlavor?.id ?? ""}
            className="mt-3 w-full rounded-[18px] border border-[rgba(111,29,42,0.18)] bg-white px-4 py-4 text-[1rem] font-semibold text-[var(--brand-brown)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
            onChange={(event) => setFlavorId(event.target.value)}
          >
            {product.flavorOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
                {option.pricePerKg > 0 ? ` (+Rs. ${option.pricePerKg}/Kg)` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {product.highlights.map((highlight) => (
          <div
            key={highlight}
            className="rounded-full border border-[var(--line)] bg-[#fffdfa] px-4 py-2.5 text-sm font-medium text-stone-700"
          >
            {highlight}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[28px] border border-[rgba(111,29,42,0.08)] bg-[linear-gradient(180deg,#fffdfb_0%,#fff6f0_100%)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[#9c7a67]">
              Selected
            </p>
            <p className="text-[1rem] font-medium text-[#6c7396]">
              <span className="font-semibold text-[var(--brand-brown)]">
                {selectedWeight?.label ?? "Base"}
              </span>
              {" / "}
              <span className="font-semibold text-[var(--brand-brown)]">
                {selectedFlavor?.label ?? "Standard"}
              </span>
            </p>
            {selectedFlavor && selectedFlavor.pricePerKg > 0 ? (
              <p className="text-sm text-[#7d6890]">
                Flavor add-on: Rs. {selectedFlavor.pricePerKg} per Kg
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-[rgba(111,29,42,0.14)] bg-[#fff7f8] px-5 py-3 text-[var(--brand-maroon)]">
              <span className="text-[0.95rem] font-semibold">Rs</span>
              <span className="ml-1.5 text-[1.7rem] font-bold leading-none">
                {priceFormatter.format(unitPrice)}/-
              </span>
            </div>
            <AddToCartButton
              slug={product.slug}
              name={`${product.name}${selectedWeight ? ` - ${selectedWeight.label}` : ""}${selectedFlavor ? ` - ${selectedFlavor.label}` : ""}`}
              price={unitPrice}
              image={product.image}
              weightId={selectedWeight?.id}
              weightLabel={selectedWeight?.label}
              weightKilograms={selectedWeight?.kilograms}
              flavorId={selectedFlavor?.id}
              flavorLabel={selectedFlavor?.label}
              flavorPricePerKg={selectedFlavor?.pricePerKg}
              customPhotoName={customPhotoName || undefined}
            />
          </div>
        </div>
      </div>

      {isPhotoCake ? (
        <div className="mt-4 rounded-[18px] border border-[rgba(0,0,0,0.1)] bg-white p-4">
          <p className="text-[0.9rem] font-semibold text-stone-900">Upload a photo to print on your cake</p>
          <input
            type="file"
            accept="image/*"
            className="mt-3 w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm"
            onChange={(event) => setCustomPhotoName(event.target.files?.[0]?.name ?? "")}
          />
          {customPhotoName ? (
            <p className="mt-2 text-[0.84rem] font-medium text-[#2f8f2f]">Selected: {customPhotoName}</p>
          ) : (
            <p className="mt-2 text-[0.82rem] text-[#6c7396]">No file selected.</p>
          )}
        </div>
      ) : null}

      <div className="mt-5 rounded-[20px] border border-[var(--line)] bg-[#fffdf9] p-4">
        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#9c7a67]">
          Check Delivery Pincode
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={deliveryPincode}
            onChange={(event) => setDeliveryPincode(event.target.value)}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            inputMode="numeric"
            className="min-w-[190px] flex-1 rounded-[14px] border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-stone-700"
          />
          <button
            type="button"
            onClick={checkPincode}
            className="rounded-full bg-[#ef7f41] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Check
          </button>
        </div>
        {pincodeFeedback ? (
          <p
            className={`mt-3 text-[0.9rem] font-semibold ${
              isPincodeValid ? "text-[#2f8f2f]" : "text-[#b53131]"
            }`}
          >
            {pincodeFeedback}
          </p>
        ) : null}
      </div>
    </>
  );
}
