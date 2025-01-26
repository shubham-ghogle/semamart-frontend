import { Order, Product } from "../../Types/types";

export async function getOrdersForSeller(id: string) {
  const res = await fetch(
    "/api/v2/order/get-seller-all-orders/" + id,
  );

  if (!res.ok) {
    throw new Error("Something went wrong");
  }
  const data = (await res.json()) as {
    success: boolean;
    orders: Order[];
    message: string;
  };
  if (!data.success) throw new Error(data.message);

  return data.orders;
}

export async function getProductsForSeller(id: string) {
  const res = await fetch(
    "/api/v2/product/get-all-products-shop/" + id,
  );

  if (!res.ok) {
    throw new Error("Something went wrong");
  }
  const data = (await res.json()) as {
    success: boolean;
    products: Product[];
    message: string;
  };
  if (!data.success) throw new Error(data.message);

  return data.products;
}
