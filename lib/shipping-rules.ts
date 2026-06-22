export const MIDNIGHT_SLOT_LABEL = "11:00 PM - 12:00 Midnight";

type ShippingZoneRule = {
  id: "zone1" | "zone2" | "zone3" | "zone4" | "zone5";
  name: string;
  baseFee: number;
  midnightSurcharge: number | null;
  pincodes: string[];
};

const SHIPPING_ZONES: ShippingZoneRule[] = [
  {
    id: "zone1",
    name: "Primary Zone",
    baseFee: 0,
    midnightSurcharge: 100,
    pincodes: ["500007", "500013", "500020", "500025", "500027", "500036", "500044", "500061"],
  },
  {
    id: "zone2",
    name: "Hyderabad Zone 2",
    baseFee: 80,
    midnightSurcharge: 150,
    pincodes: [
      "500001",
      "500002",
      "500003",
      "500004",
      "500017",
      "500022",
      "500024",
      "500029",
      "500035",
      "500039",
      "500047",
      "500060",
      "500063",
      "500080",
      "500095",
    ],
  },
  {
    id: "zone3",
    name: "Hyderabad Zone 3",
    baseFee: 120,
    midnightSurcharge: 130,
    pincodes: [
      "500012",
      "500018",
      "500023",
      "500026",
      "500028",
      "500034",
      "500040",
      "500041",
      "500053",
      "500057",
      "500058",
      "500059",
      "500065",
      "500066",
      "500068",
      "500070",
      "500074",
      "500076",
      "500082",
      "500092",
      "500098",
    ],
  },
  {
    id: "zone4",
    name: "Hyderabad Zone 4",
    baseFee: 180,
    midnightSurcharge: 120,
    pincodes: [
      "500005",
      "500006",
      "500008",
      "500009",
      "500010",
      "500011",
      "500015",
      "500016",
      "500031",
      "500033",
      "500037",
      "500038",
      "500045",
      "500048",
      "500050",
      "500051",
      "500052",
      "500056",
      "500062",
      "500064",
      "500072",
      "500073",
      "500077",
      "500079",
      "500081",
      "500096",
      "500097",
      "500114",
      "501505",
    ],
  },
  {
    id: "zone5",
    name: "Hyderabad Zone 5",
    baseFee: 320,
    midnightSurcharge: null,
    pincodes: [
      "500014",
      "500019",
      "500030",
      "500032",
      "500043",
      "500046",
      "500049",
      "500067",
      "500069",
      "500075",
      "500078",
      "500083",
      "500084",
      "500085",
      "500086",
      "500088",
      "500089",
      "500090",
      "500091",
      "500100",
      "500104",
      "500108",
      "500112",
      "501218",
      "501303",
      "501359",
      "501504",
      "501510",
      "501513",
      "502032",
    ],
  },
];

const ZONE_BY_PINCODE = new Map<string, ShippingZoneRule>();
for (const zone of SHIPPING_ZONES) {
  for (const pincode of zone.pincodes) {
    ZONE_BY_PINCODE.set(pincode, zone);
  }
}

export const DELIVERY_SLOT_OPTIONS = [
  "09:00 AM - 12:00 PM",
  "12:00 PM - 03:00 PM",
  "03:00 PM - 07:00 PM",
  "07:00 PM - 10:00 PM",
  MIDNIGHT_SLOT_LABEL,
] as const;

export function normalizeIndianPincode(value: string | undefined | null) {
  const digits = (value ?? "").replace(/\D+/g, "");
  if (!/^\d{6}$/.test(digits)) {
    return null;
  }

  return digits;
}

export function isMidnightDeliverySlot(slot: string | undefined | null) {
  const normalized = (slot ?? "").toLowerCase();
  return normalized.includes("11:00 pm") || normalized.includes("midnight");
}

export function getShippingZoneByPincode(pincode: string | undefined | null) {
  const normalized = normalizeIndianPincode(pincode);
  if (!normalized) {
    return null;
  }

  return ZONE_BY_PINCODE.get(normalized) ?? null;
}

export function getAllSupportedPincodes() {
  return Array.from(ZONE_BY_PINCODE.keys()).sort();
}

export type ShippingQuote =
  | {
      deliverable: false;
      pincode: string | null;
      deliveryFee: number;
      midnightRequested: boolean;
      reason:
        | "invalid_pincode"
        | "unsupported_pincode"
        | "midnight_not_available";
      message: string;
    }
  | {
      deliverable: true;
      pincode: string;
      zoneId: ShippingZoneRule["id"];
      zoneName: string;
      deliveryFee: number;
      baseFee: number;
      midnightSurcharge: number;
      midnightRequested: boolean;
      message: string;
    };

export function getShippingQuote(input: {
  pincode?: string | null;
  slot?: string | null;
}) {
  const normalizedPincode = normalizeIndianPincode(input.pincode);
  const midnightRequested = isMidnightDeliverySlot(input.slot);

  if (!normalizedPincode) {
    return {
      deliverable: false,
      pincode: null,
      deliveryFee: 0,
      midnightRequested,
      reason: "invalid_pincode",
      message: "Enter a valid 6-digit Hyderabad pincode.",
    } satisfies ShippingQuote;
  }

  const zone = ZONE_BY_PINCODE.get(normalizedPincode);
  if (!zone) {
    return {
      deliverable: false,
      pincode: normalizedPincode,
      deliveryFee: 0,
      midnightRequested,
      reason: "unsupported_pincode",
      message: "Sorry, we currently deliver only to selected Hyderabad pincodes.",
    } satisfies ShippingQuote;
  }

  if (midnightRequested && zone.midnightSurcharge === null) {
    return {
      deliverable: false,
      pincode: normalizedPincode,
      deliveryFee: 0,
      midnightRequested,
      reason: "midnight_not_available",
      message: "Midnight delivery is not available for this pincode. Please choose a daytime slot.",
    } satisfies ShippingQuote;
  }

  const surcharge = midnightRequested ? (zone.midnightSurcharge ?? 0) : 0;
  const deliveryFee = zone.baseFee + surcharge;

  return {
    deliverable: true,
    pincode: normalizedPincode,
    zoneId: zone.id,
    zoneName: zone.name,
    deliveryFee,
    baseFee: zone.baseFee,
    midnightSurcharge: surcharge,
    midnightRequested,
    message:
      zone.baseFee === 0 && surcharge === 0
        ? "Yeah! We deliver to this location with free shipping."
        : `Yeah! We deliver to this location. Shipping: Rs. ${deliveryFee}.`,
  } satisfies ShippingQuote;
}

