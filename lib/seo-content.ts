type ProductSeoInput = {
  name: string;
  category?: string;
  description?: string | null;
  leadTime?: string;
};

const DEFAULT_SERVICE_AREAS = [
  "Banjara Hills",
  "Jubilee Hills",
  "Gachibowli",
  "Madhapur",
  "Kondapur",
  "Hitech City",
  "Kukatpally",
  "Miyapur",
  "Secunderabad",
  "Dilsukhnagar",
];

const BASE_SEO_KEYWORDS = [
  "cakes in Hyderabad",
  "cake delivery in Hyderabad",
  "Hyderabad based cake shop",
  "Hyderabad based bakery",
  "order cake online Hyderabad",
  "same day cake delivery Hyderabad",
  "best cakes in Hyderabad",
  "custom cakes Hyderabad",
  "birthday cakes Hyderabad",
  "anniversary cakes Hyderabad",
  "wedding cakes Hyderabad",
  "theme cakes Hyderabad",
  "photo cakes Hyderabad",
  "eggless cakes Hyderabad",
  "midnight cake delivery Hyderabad",
  "online bakery Hyderabad",
  "fresh cakes Hyderabad",
  "cake shop near me Hyderabad",
  "corporate cake orders Hyderabad",
  "designer cakes Hyderabad",
  "celebration cakes Hyderabad",
];

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function cleanHtmlBits(value: string) {
  return normalizeSpaces(
    value
      .replace(/&nbsp;/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\\n/g, " ")
      .replace(/\u0026nbsp;/gi, " "),
  );
}

function stripLowValueImportedText(value: string) {
  const normalized = cleanHtmlBits(value);
  const lower = normalized.toLowerCase();
  const cutoffMarkers = [
    "some info on cake",
    "instructions to be followed",
    "cake displayed in website",
    "we bake a cake with better quality premix",
    "small plastic or wooden supporters are used",
    "don't punch cake on any ones face",
  ];

  let cutoffIndex = normalized.length;
  for (const marker of cutoffMarkers) {
    const index = lower.indexOf(marker);
    if (index >= 0 && index < cutoffIndex) {
      cutoffIndex = index;
    }
  }

  return normalizeSpaces(normalized.slice(0, cutoffIndex));
}

function toSentence(value: string, maxLength = 220) {
  if (!value) {
    return "";
  }

  if (value.length <= maxLength) {
    return value;
  }

  const sliced = value.slice(0, maxLength);
  const lastWordBoundary = sliced.lastIndexOf(" ");
  if (lastWordBoundary > 80) {
    return `${sliced.slice(0, lastWordBoundary)}.`;
  }

  return `${sliced}.`;
}

function dedupeKeywords(keywords: string[]) {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const keyword of keywords) {
    const trimmed = keyword.trim();
    if (!trimmed) {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(trimmed);
  }

  return unique;
}

export function buildSeoKeywords(extra: string[] = []) {
  const areaKeywords = DEFAULT_SERVICE_AREAS.map((area) => `cake delivery ${area} Hyderabad`);
  return dedupeKeywords([...BASE_SEO_KEYWORDS, ...areaKeywords, ...extra]);
}

export function buildCollectionSeoDescription(categoryName: string, count?: number) {
  const countPart =
    typeof count === "number" && count > 0
      ? `Browse ${count} options in our ${categoryName} collection. `
      : "";
  return `${countPart}OccasionKart is a Hyderabad-based cake shop. Order ${categoryName.toLowerCase()} cakes in Hyderabad with same day cake delivery, custom design support, and freshly baked flavors for birthdays, anniversaries, and special celebrations across the city.`;
}

export function buildGeoCoverageLine() {
  const visibleAreas = DEFAULT_SERVICE_AREAS.slice(0, 6).join(", ");
  return `We are a Hyderabad-based bakery and deliver across Hyderabad, including ${visibleAreas}, with reliable same day cake delivery slots.`;
}

export function buildProductSeoDescription({
  name,
  category = "cakes",
  description,
  leadTime = "same day",
}: ProductSeoInput) {
  const cleanedOriginal = stripLowValueImportedText(description ?? "");
  const originalSnippet = toSentence(cleanedOriginal, 200);
  const categoryLower = category.toLowerCase();
  const leadTimeLabel = leadTime.toLowerCase();
  const geoLine = buildGeoCoverageLine();
  const customLine =
    originalSnippet ||
    `Choose this ${categoryLower} cake for birthdays, anniversaries, office celebrations, and surprise gifting moments.`;

  return normalizeSpaces(
    `${name} is available for cake delivery in Hyderabad from OccasionKart, a Hyderabad-based cake store. ${customLine} Order cake online with ${leadTimeLabel} delivery, flavor choices, weight options, and personalized cake messages. Looking for the best cakes in Hyderabad? ${geoLine}`,
  );
}

export function buildProductKeywords(name: string, category: string) {
  return buildSeoKeywords([
    `${name} cake Hyderabad`,
    `${category} cake Hyderabad`,
    `${name} same day delivery Hyderabad`,
    `order ${name} online Hyderabad`,
  ]);
}

export function buildCollectionKeywords(categoryName: string) {
  return buildSeoKeywords([
    `${categoryName} cakes Hyderabad`,
    `best ${categoryName} cakes in Hyderabad`,
    `${categoryName} cake delivery Hyderabad`,
    `${categoryName} Hyderabad based`,
    `order ${categoryName} cake online Hyderabad`,
  ]);
}

export function buildProductFaqs(name: string) {
  return [
    {
      question: `Can I order ${name} with same day cake delivery in Hyderabad?`,
      answer:
        "Yes. Same day delivery is available for eligible time slots and serviceable Hyderabad locations. You can confirm the delivery slot during checkout.",
    },
    {
      question: `Can I customize message and flavor for ${name}?`,
      answer:
        "Yes. You can select available flavor and weight options and add a cake message before placing your order.",
    },
    {
      question: `Is ${name} suitable for birthdays and celebrations?`,
      answer:
        "Yes. This cake is a popular choice for birthdays, anniversaries, office events, and family celebrations in Hyderabad.",
    },
  ];
}
