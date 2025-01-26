import { redirect } from "react-router";
import { Seller } from "../../Types/types";

export type AdminSellersApiRes =
  | {
      success: true;
      sellers: Seller[];
    }
  | { success: false; message: string };

export async function getAllSellers() {
  const response = await fetch("/api/v2/shop/admin-all-sellers");

  if (!response.ok) {
    const errMessage = await response.json();
    throw new Error(errMessage.message);
  }

  const data = (await response.json()) as AdminSellersApiRes;

  if (!data.success) throw new Error(data.message);
  return data;
}

export async function getVerifiedSellers() {
  const res = await fetch("/api/v2/shop/admin-verified-sellers");

  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message);
  }

  const data = (await res.json()) as AdminSellersApiRes;
  if (!data.success) throw new Error(data.message);

  return data;
}

export function getAdminFromLocalLoader() {
  const user = localStorage.getItem("user-storage");

  if (!user) return redirect("/");

  const userData = JSON.parse(user);

  if (
    !userData.state ||
    !userData.state.user ||
    !userData.state.user.role ||
    userData.state.user.role !== "Admin"
  )
    return redirect("/");

  return null;
}
