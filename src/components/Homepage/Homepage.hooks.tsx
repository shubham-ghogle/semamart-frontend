import { Product } from "../../Types/types";

export async function getProducts() {
  const response = await fetch("/api/v2/product/get-all-products");
  const data = (await response.json()) as {
    success: boolean;
    products: Product[];
  };
  return data;
}
