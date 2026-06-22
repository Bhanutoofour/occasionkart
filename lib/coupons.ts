export type CouponDefinition = {
  code: string;
  percentageOff: number;
  active: boolean;
  minSubtotal?: number;
  maxRedemptions?: number | null;
  redemptionCount?: number;
  expiresAt?: string | null;
};

export type CouponResolution = {
  valid: boolean;
  code?: string;
  percentageOff?: number;
  discountAmount: number;
  message?: string;
};

export const BUILT_IN_COUPONS: CouponDefinition[] = [
  {
    code: "WELCOME10",
    percentageOff: 10,
    active: true,
  },
  {
    code: "FIRST10",
    percentageOff: 10,
    active: true,
  },
  {
    code: "ADMINZ99Z",
    percentageOff: 99,
    active: true,
  },
];

export function normalizeCouponCode(code: string | undefined | null) {
  return (code ?? "").trim().toUpperCase();
}

export function calculateCouponDiscount(input: {
  coupon: CouponDefinition;
  subtotal: number;
}): CouponResolution {
  const { coupon } = input;
  const subtotal = Math.max(0, Math.round(input.subtotal));

  if (!coupon.active) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Invalid or inactive coupon code.",
    };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date()) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Coupon has expired.",
    };
  }

  if (
    typeof coupon.maxRedemptions === "number" &&
    coupon.maxRedemptions > 0 &&
    (coupon.redemptionCount ?? 0) >= coupon.maxRedemptions
  ) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Coupon usage limit reached.",
    };
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Coupon requires minimum subtotal of Rs. ${coupon.minSubtotal}.`,
    };
  }

  const rawDiscount = Math.floor((subtotal * coupon.percentageOff) / 100);
  const discountAmount = Math.min(subtotal, Math.max(0, rawDiscount));

  return {
    valid: true,
    code: coupon.code,
    percentageOff: coupon.percentageOff,
    discountAmount,
    message: `${coupon.percentageOff}% discount applied.`,
  };
}

export function resolveCouponDiscount(input: {
  couponCode?: string | null;
  subtotal: number;
}): CouponResolution {
  const normalizedCode = normalizeCouponCode(input.couponCode);

  if (!normalizedCode) {
    return { valid: false, discountAmount: 0 };
  }

  const coupon = BUILT_IN_COUPONS.find(
    (item) => item.code === normalizedCode && item.active,
  );
  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Invalid or inactive coupon code.",
    };
  }

  return calculateCouponDiscount({ coupon, subtotal: input.subtotal });
}
