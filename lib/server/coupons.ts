import type { QueryResultRow } from "pg";

import {
  BUILT_IN_COUPONS,
  calculateCouponDiscount,
  normalizeCouponCode,
  type CouponDefinition,
  type CouponResolution,
} from "@/lib/coupons";
import { db } from "@/lib/db";

export type CouponMutationInput = {
  code: string;
  percentageOff: number;
  active?: boolean;
  minSubtotal?: number | null;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
};

type CouponRow = QueryResultRow & {
  code: string;
  percentage_off: number;
  active: boolean;
  min_subtotal: number | null;
  max_redemptions: number | null;
  redemption_count: number;
  expires_at: string | null;
};

let ensureCouponSchemaPromise: Promise<void> | null = null;

function mapCouponRow(row: CouponRow): CouponDefinition {
  return {
    code: row.code,
    percentageOff: row.percentage_off,
    active: row.active,
    minSubtotal: row.min_subtotal ?? undefined,
    maxRedemptions: row.max_redemptions,
    redemptionCount: row.redemption_count,
    expiresAt: row.expires_at,
  };
}

export async function ensureCouponSchema() {
  if (!ensureCouponSchemaPromise) {
    ensureCouponSchemaPromise = (async () => {
      await db.query(`
        create table if not exists coupons (
          code text primary key,
          percentage_off integer not null,
          active boolean not null default true,
          min_subtotal integer,
          max_redemptions integer,
          redemption_count integer not null default 0,
          expires_at timestamptz,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `);

      const seededCoupons = [
        { code: "BHANU99", percentageOff: 99, maxRedemptions: 1 },
        { code: "ADMINZ99Z", percentageOff: 99, maxRedemptions: null },
      ];

      for (const coupon of seededCoupons) {
        await db.query(
          `
            insert into coupons (
              code,
              percentage_off,
              active,
              min_subtotal,
              max_redemptions,
              redemption_count,
              expires_at
            ) values ($1, $2, true, null, $3, 0, null)
            on conflict (code) do update
            set
              percentage_off = excluded.percentage_off,
              active = true,
              max_redemptions = excluded.max_redemptions,
              updated_at = now()
          `,
          [coupon.code, coupon.percentageOff, coupon.maxRedemptions],
        );
      }
    })();
  }

  await ensureCouponSchemaPromise;
}

export async function listCoupons() {
  await ensureCouponSchema();

  const result = await db.query<CouponRow>(`
    select
      code,
      percentage_off,
      active,
      min_subtotal,
      max_redemptions,
      redemption_count,
      expires_at::text
    from coupons
    order by created_at desc
  `);

  return [...result.rows.map(mapCouponRow), ...BUILT_IN_COUPONS];
}

export async function createCoupon(input: CouponMutationInput) {
  await ensureCouponSchema();

  const code = normalizeCouponCode(input.code);
  const percentageOff = Math.trunc(input.percentageOff);
  const minSubtotal =
    typeof input.minSubtotal === "number" && input.minSubtotal > 0
      ? Math.trunc(input.minSubtotal)
      : null;
  const maxRedemptions =
    typeof input.maxRedemptions === "number" && input.maxRedemptions > 0
      ? Math.trunc(input.maxRedemptions)
      : null;
  const expiresAt = input.expiresAt?.trim() || null;

  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    return { ok: false as const, message: "Coupon code must be 3-32 letters or numbers." };
  }

  if (!Number.isInteger(percentageOff) || percentageOff < 1 || percentageOff > 99) {
    return { ok: false as const, message: "Percentage off must be between 1 and 99." };
  }

  const result = await db.query<CouponRow>(
    `
      insert into coupons (
        code,
        percentage_off,
        active,
        min_subtotal,
        max_redemptions,
        expires_at,
        updated_at
      ) values ($1, $2, $3, $4, $5, $6, now())
      on conflict (code) do update
      set
        percentage_off = excluded.percentage_off,
        active = excluded.active,
        min_subtotal = excluded.min_subtotal,
        max_redemptions = excluded.max_redemptions,
        expires_at = excluded.expires_at,
        updated_at = now()
      returning
        code,
        percentage_off,
        active,
        min_subtotal,
        max_redemptions,
        redemption_count,
        expires_at::text
    `,
    [
      code,
      percentageOff,
      input.active ?? true,
      minSubtotal,
      maxRedemptions,
      expiresAt,
    ],
  );

  return { ok: true as const, value: mapCouponRow(result.rows[0]) };
}

export async function resolveCouponDiscountForCheckout(input: {
  couponCode?: string | null;
  subtotal: number;
}): Promise<CouponResolution> {
  await ensureCouponSchema();

  const code = normalizeCouponCode(input.couponCode);
  if (!code) {
    return { valid: false, discountAmount: 0 };
  }

  const dbCoupon = await db.query<CouponRow>(
    `
      select
        code,
        percentage_off,
        active,
        min_subtotal,
        max_redemptions,
        redemption_count,
        expires_at::text
      from coupons
      where code = $1
      limit 1
    `,
    [code],
  );

  const coupon =
    dbCoupon.rows[0] ? mapCouponRow(dbCoupon.rows[0]) : BUILT_IN_COUPONS.find((item) => item.code === code);

  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Invalid or inactive coupon code.",
    };
  }

  return calculateCouponDiscount({ coupon, subtotal: input.subtotal });
}

export async function redeemCoupon(input: {
  couponCode?: string | null;
  subtotal: number;
}) {
  const resolution = await resolveCouponDiscountForCheckout(input);

  if (!resolution.valid || !resolution.code) {
    return resolution;
  }

  const code = normalizeCouponCode(resolution.code);
  const builtIn = BUILT_IN_COUPONS.some((coupon) => coupon.code === code);

  if (builtIn) {
    return resolution;
  }

  const result = await db.query<CouponRow>(
    `
      update coupons
      set redemption_count = redemption_count + 1,
          updated_at = now()
      where code = $1
        and active = true
        and (expires_at is null or expires_at > now())
        and (max_redemptions is null or redemption_count < max_redemptions)
      returning
        code,
        percentage_off,
        active,
        min_subtotal,
        max_redemptions,
        redemption_count,
        expires_at::text
    `,
    [code],
  );

  if (result.rows.length === 0) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Coupon usage limit reached.",
    };
  }

  return resolution;
}
