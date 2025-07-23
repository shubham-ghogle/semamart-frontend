import { Product } from "../../Types/types";

export async function getProducts() {
  const response = await fetch("/api/v2/product/get-all-products");

  if (!response.ok) throw new Error("something went wrong");

  const data = (await response.json()) as {
    success: boolean;
    products: Product[];
  };

  if (!data.success) throw new Error();

  return data.products;
}


export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`/api/v2/product/get-product/${id}`);

  if (!response.ok) throw new Error("Something went wrong");

  const data = (await response.json()) as {
    success: boolean;
    product: Product;
  };

  if (!data.success) throw new Error();

  return data.product;
}