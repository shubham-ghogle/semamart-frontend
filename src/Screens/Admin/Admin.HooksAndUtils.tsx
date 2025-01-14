import { Seller } from "../../Types/types";

type AdminAllSellersApiRes =
  | {
      success: true;
      sellers: Seller[];
    }
  | { success: false; message: string };

export async function getSellers() {
  const response = await fetch("/api/v2/shop/admin-all-sellers");

  if (!response.ok) throw new Error("something went wrong");

  const data = (await response.json()) as AdminAllSellersApiRes;

  if (!data.success) throw new Error(data.message);
  return data;
}
