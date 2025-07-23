import { Product } from "../../Types/types";

export async function getProducts() {
  const response = await fetch("/api/v2/product/get-equipment-products");

  if (!response.ok) throw new Error("something went wrong");

  const data = (await response.json()) as {
    success: boolean;
    products: Product[];
  };

  if (!data.success) throw new Error();

  return data.products;
}
