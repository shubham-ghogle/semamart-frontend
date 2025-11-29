// 🟢 Login.Hooks.js
import { redirect } from "react-router";
import { Seller, User } from "../../Types/types";
import { API_URL } from "@/data";

type UserData = {
  email: string;
  password: string;
};

type PostUserApiResponse = {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
};

type PostSellerApiResponse = {
  success: boolean;
  seller?: Seller; // <-- corrected field name
  token?: string;
  message?: string;
};

export async function postUser(userData: UserData) {
  try {
    const res = await fetch(API_URL + "user/login-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    const data = (await res.json()) as PostUserApiResponse;
    console.debug("postUser response:", data);

    if (!res.ok) throw new Error(data?.message || "Login failed");
    if (!data.success) throw new Error(data?.message || "Login failed");

    return data;
  } catch (err: any) {
    console.error("postUser error:", err);
    throw new Error(err?.message || "Something went wrong");
  }
}

export async function postSeller(userData: UserData) {
  try {
    const res = await fetch(API_URL + "shop/login-shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    const data = (await res.json()) as PostSellerApiResponse;
    console.debug("postSeller response:", data);

    if (!res.ok) throw new Error(data?.message || "Login failed");
    if (!data.success) throw new Error(data?.message || "Login failed");

    // ensure we always return { seller, token, success, message } shape
    return {
      success: data.success,
      seller: data.seller ?? null,
      token: data.token ?? null,
      message: data.message ?? "",
    } as PostSellerApiResponse;
  } catch (err: any) {
    console.error("postSeller error:", err);
    throw new Error(err?.message || "Something went wrong");
  }
}

// Redirect if user already logged in (for login page)
export function getUserFromLocalLoader() {
  const user = localStorage.getItem("user-storage");
  const seller = localStorage.getItem("seller-storage");

  if (user || seller) {
    return redirect("/");
  }
  return null;
}

// Protect user routes
export function requireUserAuth() {
  const user = localStorage.getItem("user-storage");
  if (!user) {
    return redirect("/login");
  }
  return null;
}

export function protectSellerRoute() {
  const seller = localStorage.getItem("seller-storage");
  if (!seller) return redirect("/login");
  return null;
}
