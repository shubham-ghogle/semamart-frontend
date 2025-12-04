// src/Screens/ProductDetailScreen/GetAllProduct.Hooks.ts
import { Product } from "@/Types/types";

/**
 * Fetch all visible products
 */
export async function getProducts(): Promise<Product[]> {
  const response = await fetch("/api/v2/product/get-all-products");
  if (!response.ok) {
    const txt = await response.text().catch(() => "Failed to fetch products");
    throw new Error(txt || "Failed to fetch products");
  }
  const data = await response.json();
  // API shape: { success: true, products: Product[] }
  if (data && Array.isArray(data.products)) {
    return data.products as Product[];
  }
  // If API returns array directly
  if (Array.isArray(data)) return data as Product[];
  throw new Error("Unexpected response shape from get-all-products");
}

/**
 * Fetch single product by id
 */
export async function getProductById(id: string): Promise<Product> {
  if (!id) throw new Error("Missing product id");
  const response = await fetch(`/api/v2/product/get-product/${id}`);
  if (!response.ok) {
    const txt = await response.text().catch(() => "Failed to fetch product");
    throw new Error(txt || "Failed to fetch product");
  }
  const data = await response.json();
  // API shape (your backend sometimes returns product directly or wrapped)
  if (data && data.product) return data.product as Product;
  // If returned product object directly
  return (data as unknown) as Product;
}
