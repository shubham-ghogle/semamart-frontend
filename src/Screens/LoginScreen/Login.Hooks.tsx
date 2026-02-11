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
    // Return dummy data for testing purposes
    return {
      success: true,
      user: {
        _id: "test-seller-1",
        firstName: "Test",
        lastName: "Seller",
        businessName: "Test Shop",
        businessType: "Retail",
        gstNumber: "123456789012",
        email: "seller@example.com",
        phoneNumber: "0987654321",
        role: "Seller",
        profilePic: "",
        banner: "",
        avatar: null,
        address: "123 Test Street, Test City",
        zipCode: 123456,
        availableBalance: 0,
        createdAt: "2023-10-05T14:48:00.000Z",
        verified: true,
        password: "password123",
        transections: [],
        __v: 0,
      },
    };
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
