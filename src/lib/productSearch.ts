import { API_URL } from "@/data";
import { Product } from "@/Types/types";

type CategoryLike = string | { name?: string | null } | null | undefined;

function normalizeLabel(value?: string | null) {
  return String(value || "").trim();
}

function isSameLabel(left: string, right: string) {
  return normalizeLabel(left).toLowerCase() === normalizeLabel(right).toLowerCase();
}

export function getProductCategoryLabels(product: Partial<Product> | any): string[] {
  const explicitCategoryNames: string[] = Array.isArray(product?.categoryNames)
    ? product.categoryNames
        .map((item: unknown) => normalizeLabel(typeof item === "string" ? item : ""))
        .filter((item: string) => Boolean(item))
    : [];

  if (explicitCategoryNames.length > 0) {
    return [...new Set(explicitCategoryNames)];
  }

  const categoryValues: CategoryLike[] = Array.isArray(product?.category)
    ? product.category
    : product?.category
      ? [product.category]
      : [];

  const labels: string[] = categoryValues
    .map((item) => {
      if (typeof item === "string") {
        const value = normalizeLabel(item);
        return /^[a-f0-9]{24}$/i.test(value) ? "" : value;
      }
      return normalizeLabel(item?.name);
    })
    .filter((item): item is string => Boolean(item));

  if (labels.length > 0) {
    return [...new Set(labels)];
  }

  const fallbackType = normalizeLabel(product?.productType);
  return fallbackType ? [fallbackType] : [];
}

export function matchesProductCategory(product: Partial<Product> | any, selectedCategory: string) {
  if (!selectedCategory || isSameLabel(selectedCategory, "All")) {
    return true;
  }

  return getProductCategoryLabels(product).some((label) =>
    isSameLabel(label, selectedCategory),
  );
}

export function mergeCategoryOptions(
  apiCategories: string[] = [],
  products: Array<Partial<Product> | any> = [],
) {
  const merged: string[] = [
    "All",
    ...apiCategories,
    ...products.flatMap((product) => getProductCategoryLabels(product)),
  ]
    .map((value) => normalizeLabel(value))
    .filter((value: string) => Boolean(value));

  return merged.filter(
    (value, index) => merged.findIndex((entry) => isSameLabel(entry, value)) === index,
  );
}

export async function fetchCategoryOptions() {
  const res = await fetch(`${API_URL}category`);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories (${res.status})`);
  }

  const data = await res.json().catch(() => []);
  const categories = Array.isArray(data) ? data : Array.isArray(data?.categories) ? data.categories : [];

  return categories
    .map((item: any) => normalizeLabel(item?.name))
    .filter((item: string) => Boolean(item));
}
