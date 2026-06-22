"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Product, ProductFlavorOption, ProductWeightOption } from "@/lib/store-schema";
import {
  DEFAULT_FLAVOR_OPTIONS,
  extractBaseWeightFromDescription,
  getGeneratedWeightOptions,
  slugifyOptionId,
} from "@/lib/store-schema";

type ProductFormValues = {
  name: string;
  slug: string;
  category: string;
  flavor: string;
  price: string;
  serves: string;
  leadTime: string;
  image: string;
  accent: string;
  categories: string;
  highlights: string;
  description: string;
  variantBaseWeightKg: string;
  variantMaxWeightKg: string;
  weightOptions: ProductWeightOption[];
  flavorOptions: ProductFlavorOption[];
};

const defaultServes = "Serves 6-8";

const emptyForm: ProductFormValues = {
  name: "",
  slug: "",
  category: "",
  flavor: "",
  price: "",
  serves: defaultServes,
  leadTime: "Same day",
  image: "",
  accent: "from-rose-100 via-orange-50 to-amber-100",
  categories: "",
  highlights: "Freshly baked, Hyderabad delivery",
  description: "",
  variantBaseWeightKg: "",
  variantMaxWeightKg: "",
  weightOptions: [],
  flavorOptions: [...DEFAULT_FLAVOR_OPTIONS],
};

function toFormValues(product: Product): ProductFormValues {
  const sortedWeights = [...product.weightOptions].sort((left, right) => left.kilograms - right.kilograms);
  const baseWeightKg = sortedWeights[0]?.kilograms ?? extractBaseWeightFromDescription(product.description);
  const maxWeightKg = sortedWeights.at(-1)?.kilograms ?? (baseWeightKg ? Math.max(4, baseWeightKg) : undefined);

  return {
    name: product.name,
    slug: product.slug,
    category: product.category,
    flavor: product.flavor,
    price: String(product.price),
    serves: product.serves,
    leadTime: product.leadTime,
    image: product.image,
    accent: product.accent,
    categories: product.categories.join(", "),
    highlights: product.highlights.join(", "),
    description: product.description,
    variantBaseWeightKg: baseWeightKg ? String(baseWeightKg) : "",
    variantMaxWeightKg: maxWeightKg ? String(maxWeightKg) : "",
    weightOptions: product.weightOptions,
    flavorOptions: product.flavorOptions,
  };
}

function buildPayload(values: ProductFormValues) {
  const basePrice = Number(values.price);
  const baseWeightKg = Number(values.variantBaseWeightKg);
  const maxWeightKg = Number(values.variantMaxWeightKg);
  const variantsEnabled =
    Number.isFinite(baseWeightKg) &&
    baseWeightKg > 0 &&
    Number.isFinite(maxWeightKg) &&
    maxWeightKg >= baseWeightKg;

  return {
    name: values.name,
    slug: values.slug,
    category: values.category,
    flavor: values.flavor,
    price: Number(values.price),
    serves: values.serves,
    leadTime: values.leadTime,
    image: values.image,
    accent: values.accent,
    categories: values.categories,
    highlights: values.highlights,
    description: values.description,
    weightOptions: variantsEnabled
      ? getGeneratedWeightOptions(basePrice, baseWeightKg, maxWeightKg, values.serves)
      : [],
    flavorOptions: variantsEnabled ? values.flavorOptions : [],
  };
}

function createFlavorOption(label = "", pricePerKg = 0): ProductFlavorOption {
  return {
    id: slugifyOptionId(label || "flavor"),
    label,
    pricePerKg,
  };
}

export function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [values, setValues] = useState<ProductFormValues>(emptyForm);
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const baseWeightKg = Number(values.variantBaseWeightKg);
  const maxWeightKg = Number(values.variantMaxWeightKg);
  const variantsEnabled =
    Number.isFinite(baseWeightKg) &&
    baseWeightKg > 0 &&
    Number.isFinite(maxWeightKg) &&
    maxWeightKg >= baseWeightKg;
  const generatedWeightOptions = useMemo(() => {
    const basePrice = Number(values.price);
    if (!Number.isFinite(basePrice) || basePrice <= 0 || !variantsEnabled) {
      return [];
    }

    return getGeneratedWeightOptions(basePrice, baseWeightKg, maxWeightKg, values.serves);
  }, [baseWeightKg, maxWeightKg, values.price, values.serves, variantsEnabled]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) ?? null,
    [products, selectedId],
  );

  const startCreate = () => {
    setSelectedId(null);
    setValues(emptyForm);
    setError("");
    setSuccess("");
  };

  const startEdit = (product: Product) => {
    setSelectedId(product.id);
    setValues(toFormValues(product));
    setError("");
    setSuccess("");
  };

  const updateValue = (key: keyof ProductFormValues, value: string) => {
    setValues((current) => {
      if (key === "variantBaseWeightKg") {
        const nextBaseWeight = Number(value);
        const currentMaxWeight = Number(current.variantMaxWeightKg);
        const nextMaxWeight =
          Number.isFinite(nextBaseWeight) && nextBaseWeight > 0
            ? !Number.isFinite(currentMaxWeight) || currentMaxWeight < nextBaseWeight
              ? String(Math.max(4, nextBaseWeight))
              : current.variantMaxWeightKg
            : "";

        return {
          ...current,
          variantBaseWeightKg: value,
          variantMaxWeightKg: nextMaxWeight,
        };
      }

      return { ...current, [key]: value };
    });
  };

  const replaceFlavorOptions = (flavorOptions: ProductFlavorOption[]) => {
    setValues((current) => ({ ...current, flavorOptions }));
  };

  const loadStandardFlavors = () => {
    replaceFlavorOptions([...DEFAULT_FLAVOR_OPTIONS]);
  };

  const addFlavorOption = () => {
    replaceFlavorOptions([...values.flavorOptions, createFlavorOption()]);
  };

  const updateFlavorOption = (
    index: number,
    key: keyof ProductFlavorOption,
    value: string,
  ) => {
    replaceFlavorOptions(
      values.flavorOptions.map((option, optionIndex) => {
        if (optionIndex !== index) {
          return option;
        }

        if (key === "label") {
          return {
            ...option,
            label: value,
            id: slugifyOptionId(value || option.id),
          };
        }

        return {
          ...option,
          pricePerKg: Number(value),
        };
      }),
    );
  };

  const removeFlavorOption = (index: number) => {
    replaceFlavorOptions(values.flavorOptions.filter((_, optionIndex) => optionIndex !== index));
  };

  const handleImageUpload = async (file: File) => {
    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        data?: { url: string };
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to upload the image.");
      }

      setValues((current) => ({ ...current, image: payload.data!.url }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Something went wrong while uploading the image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const isEdit = Boolean(selectedId);
      const response = await fetch(
        isEdit ? `/api/admin/products/${selectedId}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildPayload(values)),
        },
      );

      const payload = (await response.json()) as {
        data?: Product;
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to save this product.");
      }

      const savedProduct = payload.data;

      if (isEdit) {
        setProducts((current) =>
          current.map((product) => (product.id === savedProduct.id ? savedProduct : product)),
        );
        setSuccess("Product updated.");
      } else {
        setProducts((current) => [savedProduct, ...current]);
        setSelectedId(savedProduct.id);
        setSuccess("Product created.");
      }

      setValues(toFormValues(savedProduct));
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while saving the product.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <aside className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-[#fffdfb] p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[1.35rem] font-semibold text-black">Catalog</h2>
            <p className="mt-1 text-[0.95rem] text-[#6c7396]">
              {products.length} products in Neon
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-[#ef7f41] px-4 py-2 text-[0.92rem] font-semibold text-white"
            onClick={startCreate}
          >
            New Product
          </button>
        </div>

        <div className="mt-5 max-h-[680px] space-y-3 overflow-y-auto pr-1">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              className={`w-full rounded-[18px] border px-4 py-4 text-left transition ${
                selectedId === product.id
                  ? "border-[#ef7f41] bg-[#fff6f0]"
                  : "border-[rgba(0,0,0,0.08)] bg-white"
              }`}
              onClick={() => startEdit(product)}
            >
              <p className="text-[1rem] font-semibold text-stone-900">{product.name}</p>
              <p className="mt-1 text-[0.85rem] text-[#6c7396]">{product.slug}</p>
              <div className="mt-3 flex items-center justify-between text-[0.88rem] text-stone-700">
                <span>{product.category}</span>
                <span>From Rs. {product.price}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-[1.6rem] font-semibold text-black">
              {selectedProduct ? "Edit Product" : "Create Product"}
            </h2>
            <p className="mt-2 text-[0.98rem] text-[#6c7396]">
              Upload the cake image, set the default cake weight price, and control
              automatic weight and flavor variants per cake.
            </p>
          </div>
          {selectedProduct ? (
            <a
              href={`/cakes/${selectedProduct.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900"
            >
              Preview Product
            </a>
          ) : null}
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-stone-900">Name</span>
              <input
                required
                value={values.name}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("name", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-stone-900">Slug</span>
              <input
                required
                value={values.slug}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("slug", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-stone-900">Category</span>
              <input
                required
                value={values.category}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("category", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-stone-900">Lead Time</span>
              <input
                value={values.leadTime}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("leadTime", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-stone-900">Base Price (Default Weight)</span>
              <input
                required
                type="number"
                min="0"
                value={values.price}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("price", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[0.9rem] font-semibold text-stone-900">Serves</span>
              <input
                value={values.serves}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("serves", event.target.value)}
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-[0.9rem] font-semibold text-stone-900">Accent</span>
              <input
                value={values.accent}
                className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                onChange={(event) => updateValue("accent", event.target.value)}
              />
            </label>
          </div>

          <div className="space-y-3 rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfb] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[1rem] font-semibold text-stone-900">Product Image</p>
                <p className="mt-1 text-[0.92rem] text-[#6c7396]">
                  Upload an image from your device instead of pasting a URL.
                </p>
              </div>
              <label className="rounded-full bg-[#ef7f41] px-5 py-3 text-[0.95rem] font-semibold text-white">
                {isUploading ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleImageUpload(file);
                    }
                  }}
                />
              </label>
            </div>

            {values.image ? (
              <div className="overflow-hidden rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={values.image}
                  alt={values.name || "Uploaded product"}
                  className="h-[220px] w-full rounded-[14px] object-cover object-center"
                />
                <p className="mt-3 break-all text-[0.88rem] text-[#6c7396]">{values.image}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfb] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[1rem] font-semibold text-stone-900">Weight Variants</p>
                <p className="mt-1 text-[0.92rem] text-[#6c7396]">
                  Set the starting cake weight and the maximum weight. The system
                  calculates each larger option automatically using the same per-Kg rate.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[0.9rem] font-semibold text-stone-900">Default Weight (Kg)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={values.variantBaseWeightKg}
                  placeholder="1"
                  className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                  onChange={(event) => updateValue("variantBaseWeightKg", event.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-[0.9rem] font-semibold text-stone-900">Maximum Weight (Kg)</span>
                <input
                  type="number"
                  min={values.variantBaseWeightKg || "1"}
                  step="1"
                  value={values.variantMaxWeightKg}
                  placeholder="4"
                  className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                  onChange={(event) => updateValue("variantMaxWeightKg", event.target.value)}
                />
              </label>
            </div>

            {!variantsEnabled ? (
              <p className="rounded-[14px] bg-[#fff7f1] px-4 py-3 text-[0.92rem] text-[#8b5a3c]">
                Enter a default weight and maximum weight to enable cake variants. Example:
                default `2` and maximum `4` gives `2 Kg`, `3 Kg`, and `4 Kg`.
              </p>
            ) : (
              <div className="space-y-3">
                {generatedWeightOptions.map((option) => (
                  <div
                    key={option.id}
                    className="grid gap-3 rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-4 md:grid-cols-[1fr_1fr_1fr]"
                  >
                    <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] px-4 py-3 text-[0.96rem] text-stone-900">
                      {option.label}
                    </div>
                    <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] px-4 py-3 text-[0.96rem] text-stone-900">
                      {option.kilograms} Kg
                    </div>
                    <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] px-4 py-3 text-[0.96rem] font-semibold text-stone-900">
                      Rs. {option.price}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfb] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[1rem] font-semibold text-stone-900">Flavor Add-ons</p>
                <p className="mt-1 text-[0.92rem] text-[#6c7396]">
                  Price is added per Kg based on the selected flavor.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full border border-[rgba(0,0,0,0.12)] px-4 py-2 text-[0.92rem] font-semibold text-stone-900"
                  onClick={loadStandardFlavors}
                  disabled={!variantsEnabled}
                >
                  Load Standard Flavor List
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#ef7f41] px-4 py-2 text-[0.92rem] font-semibold text-white"
                  onClick={addFlavorOption}
                  disabled={!variantsEnabled}
                >
                  Add Flavor
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {values.flavorOptions.map((option, index) => (
                <div
                  key={`${option.id}-${index}`}
                  className="grid gap-3 rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-4 md:grid-cols-[1.4fr_1fr_auto]"
                >
                  <input
                    value={option.label}
                    placeholder="Flavor name"
                    className="rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                    onChange={(event) => updateFlavorOption(index, "label", event.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={option.pricePerKg}
                    placeholder="200"
                    className="rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
                    onChange={(event) =>
                      updateFlavorOption(index, "pricePerKg", event.target.value)
                    }
                  />
                  <button
                    type="button"
                  className="rounded-full border border-[rgba(0,0,0,0.12)] px-4 py-3 text-[0.92rem] font-semibold text-stone-900"
                  onClick={() => removeFlavorOption(index)}
                  disabled={!variantsEnabled}
                >
                  Remove
                </button>
                </div>
              ))}
            </div>
          </div>

          <label className="space-y-2">
            <span className="text-[0.9rem] font-semibold text-stone-900">Categories</span>
            <input
              value={values.categories}
              placeholder="Birthday, Kids Cake, Theme Cake"
              className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("categories", event.target.value)}
            />
          </label>

          <label className="space-y-2">
            <span className="text-[0.9rem] font-semibold text-stone-900">Highlights</span>
            <input
              value={values.highlights}
              placeholder="Freshly baked, Hyderabad delivery"
              className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("highlights", event.target.value)}
            />
          </label>

          <label className="space-y-2">
            <span className="text-[0.9rem] font-semibold text-stone-900">Description</span>
            <textarea
              rows={7}
              value={values.description}
              className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue("description", event.target.value)}
            />
          </label>

          {error ? (
            <p className="rounded-[14px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-[14px] bg-[#f1fff1] px-4 py-3 text-[0.95rem] text-[#2f8f2f]">
              {success}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              disabled={isPending || isUploading}
              className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
            >
              {isPending
                ? selectedProduct
                  ? "Saving..."
                  : "Creating..."
                : selectedProduct
                  ? "Save Product"
                  : "Create Product"}
            </button>
            <button
              type="button"
              className="rounded-full border border-[rgba(0,0,0,0.12)] px-6 py-3 text-[1rem] font-semibold text-stone-900"
              onClick={startCreate}
            >
              Clear Form
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
