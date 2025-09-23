import { Product } from "../../Types/types";

export async function getProductDetail(id: string | undefined) {
  const res = await fetch("/api/v2/product/get-product/" + id);

  if (!res.ok) {
    throw new Error("something went wrong");
  }

  const product = await res.json() as Product;

  return product;
}
