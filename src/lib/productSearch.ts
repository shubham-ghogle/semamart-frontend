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
  const categoryValues: CategoryLike[] = Array.isArray(product?.category)
    ? product.category
    : product?.category
      ? [product.category]
      : [];

  const labels = categoryValues
    .map((item) => {
      if (typeof item === "string") return normalizeLabel(item);
      return normalizeLabel(item?.name);
    })
    .filter(Boolean);

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
  const merged = [
    "All",
    ...apiCategories,
    ...products.flatMap((product) => getProductCategoryLabels(product)),
  ]
    .map((value) => normalizeLabel(value))
    .filter(Boolean);

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
    .filter(Boolean);
}
