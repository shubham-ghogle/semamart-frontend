import { Product } from "@/Types/types";

/**
 * Fetch products for a given shop id.
 * Adjust the fetch path if your API is prefixed (e.g. /api/...).
 */
type ShopPayload = {
  success: boolean;
  shop?: {
    _id?: string;
    businessName?: string;
    banner?: string;
    profilePic?: string;
    verified?: boolean;
    // add other fields you need from the API here
  };
};

export async function fetchShopInfo(shopId: string): Promise<ShopPayload> {
  const res = await fetch(`/api/v2/shop/get-shop-info/${shopId}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch shop info: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getProductsByShop(shopId: string): Promise<Product[]> {
  if (!shopId) return [];

  const res = await fetch(`/api/v2/product/get-all-products-shop/${shopId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // add Authorization header here if required
    },
  });

  let json: any;
  try {
    json = await res.json();
  } catch (err) {
    throw new Error("Failed to parse products response");
  }

  if (!res.ok) {
    const message = json?.message || json?.error || "Failed to fetch products";
    throw new Error(message);
  }

  // backend returns { success: true, products }
  return (json.products ?? []) as Product[];
}
