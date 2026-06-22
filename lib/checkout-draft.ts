import { DELIVERY_SLOT_OPTIONS } from "@/lib/shipping-rules";

export type CheckoutDraft = {
  fullName: string;
  phone: string;
  alternatePhone: string;
  email: string;
  houseNumber: string;
  aptLane: string;
  landmark: string;
  colonyArea: string;
  mapLink: string;
  city: string;
  state: string;
  country: string;
  deliveryPincode: string;
  address: string;
  deliveryDate: string;
  deliverySlot: string;
  deliveryTime: string;
  couponCode: string;
  cakeMessage: string;
  senderName: string;
};

export const CHECKOUT_DRAFT_STORAGE_KEY = "ock-checkout-draft";

export const defaultCheckoutDraft: CheckoutDraft = {
  fullName: "",
  phone: "",
  alternatePhone: "",
  email: "",
  houseNumber: "",
  aptLane: "",
  landmark: "",
  colonyArea: "",
  mapLink: "",
  city: "Hyderabad",
  state: "Telangana",
  country: "India",
  deliveryPincode: "",
  address: "",
  deliveryDate: "",
  deliverySlot: DELIVERY_SLOT_OPTIONS[0],
  deliveryTime: "",
  couponCode: "",
  cakeMessage: "",
  senderName: "",
};

export function readCheckoutDraft(): CheckoutDraft {
  if (typeof window === "undefined") {
    return defaultCheckoutDraft;
  }

  try {
    const raw = window.localStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
    if (!raw) {
      return defaultCheckoutDraft;
    }

    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    return {
      ...defaultCheckoutDraft,
      ...parsed,
    };
  } catch {
    return defaultCheckoutDraft;
  }
}

export function writeCheckoutDraft(value: CheckoutDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHECKOUT_DRAFT_STORAGE_KEY, JSON.stringify(value));
}
