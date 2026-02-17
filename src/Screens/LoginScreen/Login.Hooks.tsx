// 🟢 Login.Hooks.ts
import { redirect } from "react-router";
import { Seller, User } from "../../Types/types";
import { API_URL } from "@/data";

// ✅ Updated: Add optional role for admin/other roles
export type UserData = {
  email: string;
  password: string;
  role?: string; // optional role: Admin, Manager, Accountant, DigitalMedia
};

type PostUserApiResponse = {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
};

type PostSellerApiResponse = {
  success: boolean;
  user?: Seller;
  token?: string;
  message?: string;
};

// ---------------------------------
// Login for regular users / admins
// ---------------------------------
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
    if (data.user && data.user.role !== userData.role) {
      throw new Error(`You are not allowed to login as ${userData.role}`);
    }

    return data;
  } catch (err: any) {
    console.error("postUser error:", err);
    throw new Error(err?.message || "Something went wrong");
  }
}

// ---------------------------------
// Login for sellers (if you still need it)
// ---------------------------------
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

    if (!res.ok) throw new Error(data?.message || "Seller login failed");
    if (!data.success) throw new Error(data?.message || "Seller login failed");

    return data;
  } catch (err: any) {
    throw new Error(err?.message || "Something went wrong");
  }
}

// ---------------------------------
// Redirects if user already logged in
// ---------------------------------
export function getUserFromLocalLoader() {
  const userRaw = localStorage.getItem("user-storage");
  const sellerRaw = localStorage.getItem("seller-storage");

  // If seller is logged in → go to seller dashboard
  if (sellerRaw) {
    console.log("Seller is logged in, redirecting to /seller");
    return redirect("/seller");
  }

  // If user/admin is logged in → go to admin dashboard
  if (userRaw) {
    console.log("User is logged in, redirecting to /admin");
    return redirect("/admin");
  }

  // otherwise allow login page to load
  return null;
}

// ---------------------------------
// Protect user/admin routes
// ---------------------------------
export function requireUserAuth() {
  const user = localStorage.getItem("user-storage");
  if (!user) {
    return redirect("/login");
  }
  return null;
}

// Protect seller routes
export function protectSellerRoute() {
  const seller = localStorage.getItem("seller-storage");
  if (!seller) return redirect("/login");
  return null;
}
