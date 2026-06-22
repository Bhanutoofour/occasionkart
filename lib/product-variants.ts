import type { Product } from "@/lib/store-schema";

export function getDefaultWeightOption(product: Pick<Product, "weightOptions">) {
  return product.weightOptions[0];
}

export function getDefaultFlavorOption(product: Pick<Product, "flavorOptions">) {
  return product.flavorOptions[0];
}

export function resolveVariantPricing(
  product: Pick<Product, "price" | "weightOptions" | "flavorOptions">,
  weightId?: string | null,
  flavorId?: string | null,
) {
  if (product.weightOptions.length === 0 || product.flavorOptions.length === 0) {
    return {
      selectedWeight: undefined,
      selectedFlavor: undefined,
      unitPrice: product.price,
    };
  }

  const selectedWeight =
    product.weightOptions.find((option) => option.id === weightId) ??
    getDefaultWeightOption(product);
  const selectedFlavor =
    product.flavorOptions.find((option) => option.id === flavorId) ??
    getDefaultFlavorOption(product);

  const basePrice = selectedWeight?.price ?? product.price;
  const kilograms = selectedWeight?.kilograms ?? 1;
  const flavorPricePerKg = selectedFlavor?.pricePerKg ?? 0;

  return {
    selectedWeight,
    selectedFlavor,
    unitPrice: basePrice + flavorPricePerKg * kilograms,
  };
}

export function getDisplayPrice(product: Pick<Product, "price" | "weightOptions" | "flavorOptions">) {
  return resolveVariantPricing(product).unitPrice;
}

export function buildCartItemKey(slug: string, weightId?: string | null, flavorId?: string | null) {
  return [slug, weightId ?? "base", flavorId ?? "default"].join("::");
}
