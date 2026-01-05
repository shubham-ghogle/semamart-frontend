import { API_URL } from "@/data";
import { Product } from "../../Types/types";

export async function getProducts() {
  const response = await fetch(API_URL+"product/get-equipment-products");

  if (!response.ok) throw new Error("something went wrong");

  const data = (await response.json()) as {
    success: boolean;
    products: Product[];
  };

  if (!data.success) throw new Error();

  return data.products;
}
