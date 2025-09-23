import { Product } from "../../Types/types";

export async function getProductDetail(id: string | undefined) {
  const res = await fetch("/api/v2/product/get-product/" + id);

  if (!res.ok) {
    throw new Error("something went wrong");
  }

  const json = await res.json();

  const product = json.product as Product;

  // Attach defaultVariant so frontend can access product.defaultVariant
  (product as any).defaultVariant =
    json.defaultVariant || product.variants?.[0] || null;

  return product;
}
