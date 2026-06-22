const PRODUCT_IMAGE_PROXY_PATH = "/api/image-proxy";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541781286675-9bca0d6d7d07?auto=format&fit=crop&w=900&q=80";
const BLOCKED_PREFIXES = [
  "https://occasionkart.com/wp-content/uploads",
  "https://your-new-storage-domain",
  "https://placeholder.invalid",
];

function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function shouldProxyProductImages() {
  const value = (process.env.PRODUCT_IMAGE_PROXY_ENABLED ?? "").trim().toLowerCase();
  if (!value) {
    return true;
  }
  return value === "1" || value === "true" || value === "yes";
}

function isBlockedSourceUrl(value: string) {
  return BLOCKED_PREFIXES.some((prefix) => value.startsWith(prefix));
}

export function getProductImageUrl(input: string | null | undefined) {
  const trimmed = (input ?? "").trim();
  if (!trimmed) {
    return FALLBACK_IMAGE;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  const normalized = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  if (!isHttpUrl(normalized)) {
    return FALLBACK_IMAGE;
  }

  if (isBlockedSourceUrl(normalized)) {
    return FALLBACK_IMAGE;
  }

  if (!shouldProxyProductImages()) {
    return normalized;
  }

  return `${PRODUCT_IMAGE_PROXY_PATH}?src=${encodeURIComponent(normalized)}`;
}
