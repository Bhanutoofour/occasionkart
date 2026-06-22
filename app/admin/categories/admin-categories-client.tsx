"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Product } from "@/lib/store-schema";

type CategorySummary = {
  name: string;
  count: number;
};

type Props = {
  initialProducts: Product[];
  initialCategories: CategorySummary[];
};

export function AdminCategoriesClient({ initialProducts, initialCategories }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategories[0]?.name ?? "");
  const [categoryInput, setCategoryInput] = useState(initialCategories[0]?.name ?? "");
  const [search, setSearch] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory
        ? product.categories.some((category) => category.toLowerCase() === activeCategory.toLowerCase())
        : true;
      const matchesQuery = query
        ? [product.name, product.slug, ...product.categories].join(" ").toLowerCase().includes(query)
        : true;
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, products, search]);

  const selectedVisibleCount = visibleProducts.filter((product) => selectedIds.includes(product.id)).length;

  const toggleProduct = (productId: string) => {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const toggleVisibleProducts = () => {
    const visibleIds = visibleProducts.map((product) => product.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const applyBulkUpdate = async (action: "add" | "remove") => {
    setIsPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryInput,
          productIds: selectedIds,
          action,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        data?: {
          updatedCount: number;
          products: Product[];
          categories: CategorySummary[];
        };
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to update categories.");
      }

      setProducts(payload.data.products);
      setCategories(payload.data.categories);
      setSelectedIds([]);
      setActiveCategory(categoryInput.trim());
      setMessage(
        action === "add"
          ? `Added ${payload.data.updatedCount} products to ${categoryInput}.`
          : `Removed ${payload.data.updatedCount} products from ${categoryInput}.`,
      );
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update categories.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-[2rem] font-semibold text-black">Category Manager</h2>
            <p className="mt-2 max-w-[72ch] text-[1rem] leading-8 text-[#6c7396]">
              Add products to a category, remove products from a category, and bulk-manage
              category membership without opening each product one by one.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              value={categoryInput}
              onChange={(event) => setCategoryInput(event.target.value)}
              placeholder="Category name"
              className="rounded-full border border-[rgba(0,0,0,0.12)] px-4 py-3 text-[0.95rem] text-stone-900"
            />
            <button
              type="button"
              onClick={() => void applyBulkUpdate("add")}
              disabled={isPending}
              className="rounded-full bg-[#ef7f41] px-5 py-3 text-[0.95rem] font-semibold text-white disabled:opacity-70"
            >
              Add Selected
            </button>
            <button
              type="button"
              onClick={() => void applyBulkUpdate("remove")}
              disabled={isPending}
              className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900 disabled:opacity-70"
            >
              Remove Selected
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="w-full max-w-[320px] rounded-full border border-[rgba(0,0,0,0.12)] px-4 py-3 text-[0.95rem] text-stone-900"
          />
          <button
            type="button"
            onClick={toggleVisibleProducts}
            className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900"
          >
            {selectedVisibleCount === visibleProducts.length && visibleProducts.length > 0
              ? "Unselect Visible"
              : "Select Visible"}
          </button>
          <div className="rounded-full bg-[#fff7f2] px-5 py-3 text-[0.95rem] font-semibold text-stone-900">
            {selectedIds.length} selected
          </div>
        </div>

        {message ? (
          <p className="mt-4 rounded-[14px] bg-[#f1fff1] px-4 py-3 text-[0.95rem] text-[#2f8f2f]">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-[14px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {error}
          </p>
        ) : null}
      </div>

      <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-[#fffdfb] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
        <p className="text-[1rem] font-semibold text-stone-900">Categories</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory("")}
            className={`rounded-full px-4 py-2 text-[0.92rem] font-semibold ${
              activeCategory === "" ? "bg-[var(--brand-brown)] text-white" : "border border-[var(--line)] bg-white text-stone-700"
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <div
              key={category.name}
              className={`flex items-center overflow-hidden rounded-full border ${
                activeCategory.toLowerCase() === category.name.toLowerCase()
                  ? "border-[var(--brand-brown)]"
                  : "border-[var(--line)]"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(category.name);
                  setCategoryInput(category.name);
                }}
                className={`px-4 py-2 text-[0.92rem] font-semibold ${
                  activeCategory.toLowerCase() === category.name.toLowerCase()
                    ? "bg-[var(--brand-brown)] text-white"
                    : "bg-white text-stone-700"
                }`}
              >
                {category.name} ({category.count})
              </button>
              <Link
                href={`/category/${slugify(category.name)}`}
                target="_blank"
                className="border-l border-[rgba(0,0,0,0.08)] bg-[#fff7f2] px-3 py-2 text-[0.84rem] font-semibold text-[#ef7f41]"
              >
                Open
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product) => {
          const selected = selectedIds.includes(product.id);
          return (
            <label
              key={product.id}
              className={`flex cursor-pointer gap-4 rounded-[20px] border p-4 transition ${
                selected
                  ? "border-[#ef7f41] bg-[#fff7f2]"
                  : "border-[rgba(0,0,0,0.1)] bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleProduct(product.id)}
                className="mt-1 h-4 w-4"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[1rem] font-semibold text-stone-900">{product.name}</p>
                <p className="mt-1 text-[0.84rem] text-[#6c7396]">{product.slug}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <span
                      key={`${product.id}-${category}`}
                      className="rounded-full bg-[#fff3ea] px-3 py-1 text-[0.8rem] font-semibold text-stone-700"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
