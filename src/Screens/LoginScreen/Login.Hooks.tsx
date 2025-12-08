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
  user: Seller; // <-- corrected field name
};

export async function postUser(userData: UserData) {
  try {
    const res = await fetch(API_URL + "user/login-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });
    const data = (await res.json()) as PostSellerApiResponse;
    if (!res.ok) throw new Error(res.statusText);
    if (!data.success) throw new Error(res.statusText);
    return data;
  } catch {
    throw new Error("Something went wrong");
  }
}

// Redirect if user already logged in (for login page)
export function getUserFromLocalLoader() {
  const userRaw = localStorage.getItem("user-storage");
  const sellerRaw = localStorage.getItem("seller-storage");

  // 🎯 If seller is logged in → go to seller dashboard
  if (sellerRaw) {
    console.log("Seller is logged in, redirecting to /seller");
    return redirect("/seller");
  }

  // 🎯 If normal user is logged in → go to user home (same as before)
  if (userRaw) {
    console.log("User is logged in, redirecting to /");
    return redirect("/");
  }

  // otherwise allow login page to load
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
