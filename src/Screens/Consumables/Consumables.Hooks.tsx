import { API_URL } from "@/data";
import { Product } from "../../Types/types";

export async function getProducts() {
  const response = await fetch(API_URL + "product/get-all-products-updated-random");

  if (!response.ok) throw new Error("something went wrong");

  const data = (await response.json()) as {
    success: boolean;
    products: Product[];
  };

  if (!data.success) throw new Error();

  return data.products;
}

type BestSellerParams = {
  shopId?: string;
  category?: string | string[]; // single id or comma-separated / array
  limit?: number;
  qtyWeight?: number;
  ordersWeight?: number;
};

export async function getBestSellers({
  shopId,
  category,
  limit = 10,
  qtyWeight = 1,
  ordersWeight = 5,
}: BestSellerParams = {}) {
  const base = new URL(API_URL + "product/best-sellers");

  if (shopId) base.searchParams.append("shopId", shopId);

  if (category) {
    // If user passed array, join with commas to match backend support
    const cat = Array.isArray(category) ? category.join(",") : category;
    base.searchParams.append("category", cat);
  }

  if (limit) base.searchParams.append("limit", String(limit));
  if (qtyWeight) base.searchParams.append("qtyWeight", String(qtyWeight));
  if (ordersWeight) base.searchParams.append("ordersWeight", String(ordersWeight));

  const response = await fetch(base.toString());

  if (!response.ok) throw new Error("Failed to fetch best sellers");

  const data = (await response.json()) as {
    success: boolean;
    products: Product[];
  };

  if (!data.success) throw new Error("Best seller API failed");

  return data.products;
}

// add this to your api/hooks file (where getProducts/getBestSellers live)
export async function getCategories() {
  const response = await fetch(API_URL + "category"); // backend route returns array
  if (!response.ok) throw new Error("Failed to fetch categories");
  const data = await response.json();
  // backend returns raw array of categories (not { success: true })
  return data;
}

