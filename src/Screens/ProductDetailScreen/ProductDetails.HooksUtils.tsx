import { Product } from "../../Types/types";

export async function getProductDetail(id: string | undefined) {
  const res = await fetch("/api/v2/product/get-product/" + id);

  if (!res.ok) {
    throw new Error("something went wrong");
  }

  const data = (await res.json()) as Product
  return data;
}
