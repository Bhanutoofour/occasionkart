import { describe, expect, it } from "vitest";

import { MIDNIGHT_SLOT_LABEL, getShippingQuote, normalizeIndianPincode } from "@/lib/shipping-rules";

describe("shipping rules", () => {
  it("normalizes valid and invalid pincodes", () => {
    expect(normalizeIndianPincode("500 007")).toBe("500007");
    expect(normalizeIndianPincode("abc")).toBeNull();
    expect(normalizeIndianPincode("50007")).toBeNull();
  });

  it("returns free shipping in primary zone", () => {
    const quote = getShippingQuote({ pincode: "500007", slot: "09:00 AM - 12:00 PM" });
    expect(quote.deliverable).toBe(true);
    if (!quote.deliverable) {
      return;
    }

    expect(quote.zoneId).toBe("zone1");
    expect(quote.deliveryFee).toBe(0);
  });

  it("applies midnight surcharge for eligible zones", () => {
    const quote = getShippingQuote({ pincode: "500001", slot: MIDNIGHT_SLOT_LABEL });
    expect(quote.deliverable).toBe(true);
    if (!quote.deliverable) {
      return;
    }

    expect(quote.zoneId).toBe("zone2");
    expect(quote.baseFee).toBe(80);
    expect(quote.midnightSurcharge).toBe(150);
    expect(quote.deliveryFee).toBe(230);
  });

  it("blocks midnight delivery in zone 5", () => {
    const quote = getShippingQuote({ pincode: "500014", slot: MIDNIGHT_SLOT_LABEL });
    expect(quote.deliverable).toBe(false);
    if (quote.deliverable) {
      return;
    }

    expect(quote.reason).toBe("midnight_not_available");
  });

  it("blocks unsupported pincodes", () => {
    const quote = getShippingQuote({ pincode: "560001", slot: "09:00 AM - 12:00 PM" });
    expect(quote.deliverable).toBe(false);
    if (quote.deliverable) {
      return;
    }

    expect(quote.reason).toBe("unsupported_pincode");
  });
});

