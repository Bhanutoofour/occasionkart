"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/store/cart-context";
import {
  type CheckoutDraft,
  readCheckoutDraft,
  writeCheckoutDraft,
} from "@/lib/checkout-draft";
import { DELIVERY_SLOT_OPTIONS, getShippingQuote } from "@/lib/shipping-rules";

export function CartPageClient() {
  const { items, updateQuantity, removeItem } = useCart();
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft>(() => readCheckoutDraft());
  const [saveMessage, setSaveMessage] = useState("");

  const updateDraftField = (field: keyof CheckoutDraft, value: string) => {
    setCheckoutDraft((prev) => ({ ...prev, [field]: value }));
  };

  const saveDraft = () => {
    writeCheckoutDraft(checkoutDraft);
    setSaveMessage("Delivery details saved for checkout");
    window.setTimeout(() => setSaveMessage(""), 1800);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingQuote = getShippingQuote({
    pincode: checkoutDraft.deliveryPincode,
    slot: checkoutDraft.deliverySlot,
  });
  const delivery = items.length > 0 && shippingQuote.deliverable ? shippingQuote.deliveryFee : 0;
  const total = subtotal + delivery;

  return (
    <main className="flex-1">
      <section className="page-pad mx-auto grid w-full max-w-7xl gap-8 py-14 lg:grid-cols-[1.1fr_0.75fr]">
        <div>
          <p className="section-kicker">Cart</p>
          <h1 className="section-title">Review your celebration order</h1>
          {items.length === 0 ? (
            <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-white p-6 text-stone-600">
              Your cart is empty. Browse cakes to add items.
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {items.map((item) => (
                <article
                  key={item.key}
                  className="grid gap-5 rounded-[32px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_45px_rgba(77,37,28,0.06)] sm:grid-cols-[180px_1fr]"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="aspect-[4/3] w-full rounded-[24px] object-cover object-center"
                  />
                  <div className="flex flex-col justify-between gap-4">
                    <div>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--brand-brown)]">
                        {item.name}
                      </h2>
                      <p className="mt-2 text-[0.96rem] text-[#6c7396]">
                        {item.weightLabel ?? "Standard weight"}
                        {item.flavorLabel ? ` - ${item.flavorLabel}` : ""}
                      </p>
                      {item.customPhotoName ? (
                        <p className="mt-1 text-[0.86rem] font-semibold text-[#2f8f2f]">
                          Photo upload: {item.customPhotoName}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          className="h-9 w-9 rounded-full border border-[var(--line)]"
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold text-stone-700">
                          {item.quantity}
                        </span>
                        <button
                          className="h-9 w-9 rounded-full border border-[var(--line)]"
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          className="text-sm text-[#ef7f41]"
                          type="button"
                          onClick={() => removeItem(item.key)}
                        >
                          Remove
                        </button>
                        <p className="text-2xl font-bold text-[var(--brand-brown)]">
                          Rs. {item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-[#fffaf6] p-5 sm:p-6">
            <h2 className="text-[1.2rem] font-semibold text-[var(--brand-brown)]">
              Delivery Details Before Checkout
            </h2>
            <p className="mt-2 text-[0.94rem] text-[#6c7396]">
              Fill this once and continue to checkout with delivery address, slot, date, cake
              message, and sender name prefilled.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <input
                value={checkoutDraft.fullName}
                onChange={(event) => updateDraftField("fullName", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="Your full name"
              />
              <input
                value={checkoutDraft.phone}
                onChange={(event) => updateDraftField("phone", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="Phone number"
              />
              <input
                value={checkoutDraft.alternatePhone}
                onChange={(event) => updateDraftField("alternatePhone", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="Alternate phone number (optional)"
              />
              <input
                value={checkoutDraft.email}
                onChange={(event) => updateDraftField("email", event.target.value)}
                type="email"
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="Email (optional)"
              />
              <input
                value={checkoutDraft.houseNumber}
                onChange={(event) => updateDraftField("houseNumber", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="H No"
              />
              <input
                value={checkoutDraft.aptLane}
                onChange={(event) => updateDraftField("aptLane", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="Apt name / Lane name"
              />
              <input
                value={checkoutDraft.landmark}
                onChange={(event) => updateDraftField("landmark", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="Landmark (optional)"
              />
              <input
                value={checkoutDraft.colonyArea}
                onChange={(event) => updateDraftField("colonyArea", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="Colony / Area"
              />
              <input
                value={checkoutDraft.mapLink}
                onChange={(event) => updateDraftField("mapLink", event.target.value)}
                type="url"
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="Google map link (optional)"
              />
              <input
                value={checkoutDraft.city}
                onChange={(event) => updateDraftField("city", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="City"
              />
              <input
                value={checkoutDraft.deliveryPincode}
                onChange={(event) => updateDraftField("deliveryPincode", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="Delivery pincode"
                maxLength={6}
                inputMode="numeric"
              />
              <input
                value={checkoutDraft.state}
                readOnly
                disabled
                className="rounded-[14px] border border-[var(--line)] bg-stone-100 px-4 py-3 text-sm text-stone-700"
                placeholder="State"
              />
              <input
                value={checkoutDraft.country}
                readOnly
                disabled
                className="rounded-[14px] border border-[var(--line)] bg-stone-100 px-4 py-3 text-sm text-stone-700"
                placeholder="Country"
              />
              <input
                value={checkoutDraft.deliveryDate}
                onChange={(event) => updateDraftField("deliveryDate", event.target.value)}
                type="date"
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
              />
              <select
                value={checkoutDraft.deliverySlot}
                onChange={(event) => updateDraftField("deliverySlot", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
              >
                {DELIVERY_SLOT_OPTIONS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <input
                value={checkoutDraft.senderName}
                onChange={(event) => updateDraftField("senderName", event.target.value)}
                className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
                placeholder="Sender name on greeting"
              />
            </div>
            <input
              value={checkoutDraft.cakeMessage}
              onChange={(event) => updateDraftField("cakeMessage", event.target.value)}
              className="mt-3 w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-stone-700"
              placeholder="Message on cake"
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveDraft}
                className="rounded-full bg-[#ef7f41] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Save Delivery Details
              </button>
              {saveMessage ? (
                <span className="text-[0.85rem] font-semibold text-[#2f8f2f]">{saveMessage}</span>
              ) : null}
            </div>
            {checkoutDraft.deliveryPincode ? (
              <p
                className={`mt-3 text-[0.9rem] font-semibold ${
                  shippingQuote.deliverable ? "text-[#2f8f2f]" : "text-[#b53131]"
                }`}
              >
                {shippingQuote.message}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="rounded-[36px] border border-[var(--line)] bg-[linear-gradient(180deg,#fff,#fff6ef)] p-8 shadow-[0_22px_55px_rgba(77,37,28,0.08)]">
          <p className="section-kicker">Summary</p>
          <div className="mt-8 space-y-4 text-sm text-stone-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>Rs. {subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <span>Rs. {delivery}</span>
            </div>
            {items.length > 0 && !shippingQuote.deliverable ? (
              <p className="text-[0.84rem] font-semibold text-[#b53131]">
                Enter a serviceable pincode to continue checkout.
              </p>
            ) : null}
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span className="text-[var(--brand-red)]">Applied at checkout</span>
            </div>
          </div>
          <div className="mt-6 border-t border-[var(--line)] pt-6">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-stone-800">Total</span>
              <span className="text-3xl font-bold text-[var(--brand-brown)]">
                Rs. {total}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/checkout"
              className="block w-full rounded-full bg-[var(--brand-red)] px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_18px_35px_rgba(189,39,26,0.24)]"
            >
              Proceed to checkout
            </Link>
            <Link
              href="/cakes"
              className="block w-full rounded-full border border-[var(--line)] px-5 py-3 text-center text-sm font-semibold text-stone-700"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}




