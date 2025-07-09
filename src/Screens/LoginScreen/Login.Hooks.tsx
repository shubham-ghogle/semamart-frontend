import { redirect } from "react-router";
import { Seller, User } from "../../Types/types";

type UserData = {
  email: string;
  password: string;
};

type PostUserApiResponse = {
  success: boolean;
  user: User;
  token: string;
  message?: string;
};

type PostSellerApiResponse = {
  success: boolean;
  user: Seller;
  token: string;
  message?: string;
};

export async function postUser(userData: UserData) {
  try {
    const res = await fetch("/api/v2/user/login-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const data = (await res.json()) as PostUserApiResponse;
    if (!res.ok) {
      throw new Error(data.message);
    }
    if (!data.success) throw new Error(data.message);
    return data;
  } catch {
    throw new Error("Something went wrong");

  }
}

export async function postSeller(userData: UserData) {
  try {
    const res = await fetch("/api/v2/shop/login-shop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const data = (await res.json()) as PostSellerApiResponse;

    if (!res.ok) {
      throw new Error(data.message);
    }
    if (!data.success) throw new Error(data.message);
    return data;
  } catch {
    throw new Error("Something went wrong");
  }
}

export function getUserFromLocalLoader() {
  const user = localStorage.getItem("user-storage");
  const seller = localStorage.getItem("seller-storage");

  if (user) {
    return redirect("/");
  }
  if (seller) {
    return redirect("/");
  }

  return null;
}
