import { redirect } from "react-router";
import { Order, Product } from "../../Types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ====== Sellers ======
export interface Seller {
  _id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
  role: string;
  createdAt: string;
}

export type AdminSellersApiRes =
  | { success: true; sellers: Seller[] }
  | { success: false; message: string };

export async function getAllSellers(): Promise<{ sellers: Seller[] }> {
  const response = await fetch("/api/v2/shop/admin-all-sellers");
  if (!response.ok) {
    const errMessage = await response.json();
    throw new Error(errMessage.message || "Failed to fetch sellers");
  }

  const data = (await response.json()) as AdminSellersApiRes;
  if (!data.success) throw new Error(data.message);
  return { sellers: data.sellers };
}

export async function getVerifiedSellers(): Promise<{ sellers: Seller[] }> {
  const res = await fetch("/api/v2/shop/admin-verified-sellers");
  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message || "Failed to fetch verified sellers");
  }

  const data = (await res.json()) as AdminSellersApiRes;
  if (!data.success) throw new Error(data.message);
  return { sellers: data.sellers };
}

export async function deleteSeller(id: string) {
  const res = await fetch(`/api/v2/shop/delete-seller/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message || "Failed to delete seller");
  }

  const data = (await res.json()) as { success: boolean; message: string };
  if (!data.success) throw new Error(data.message);
  return data.message;
}

// ====== Orders ======
export type AdminOrdersApiRes =
  | { success: true; orders: Order[] }
  | { success: false; message: string };

export async function getAllOrders() {
  const token = localStorage.getItem("user-token");
  const response = await fetch("/api/v2/order/admin-all-orders", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw new Error(errMessage.message);
  }

  const data = (await response.json()) as AdminOrdersApiRes;
  if (!data.success) throw new Error(data.message);
  return data;
}

// ====== Products ======
export async function getAdminProducts() {
  const token = localStorage.getItem("user-token");
  const res = await fetch("/api/v2/product/admin-all-products", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Something went wrong");

  const data = (await res.json()) as {
    success: boolean;
    products: Product[];
    message: string;
  };
  if (!data.success) throw new Error(data.message);
  return data.products;
}

// ====== Users ======
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export type AdminUsersApiRes =
  | { success: true; users: User[] }
  | { success: false; message: string };

export async function getAllUsers(): Promise<User[]> {
  const token = localStorage.getItem("user-token");
  const res = await fetch("/api/v2/user/admin-all-users", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message);
  }

  const data = (await res.json()) as AdminUsersApiRes;
  if (!data.success) throw new Error(data.message);
  return data.users;
}

export async function deleteUser(id: string) {
  const token = localStorage.getItem("user-token");
  const res = await fetch(`/api/v2/user/delete-user/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message);
  }

  const data = (await res.json()) as { success: boolean; message: string };
  if (!data.success) throw new Error(data.message);
  return data.message;
}

// ====== Admin Loader ======
export function getAdminFromLocalLoader() {
  const user = localStorage.getItem("user-storage");
  if (!user) return redirect("/");

  const userData = JSON.parse(user);
  if (!userData.state?.user?.role || userData.state.user.role !== "Admin")
    return redirect("/");

  return null;
}

export async function getAdminOrderDetails(orderId?: string) {
  if (!orderId) throw new Error("Something went wrong");

  const res = await fetch("/api/v2/order/get-order-details-admin/" + orderId);

  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message);
  }

  const data = (await res.json()) as Order;

  return data;
}

export function useAdminOrderMutation() {
  const qc = useQueryClient();

  const { status: mutationStatus, mutateAsync: mutateOrder } = useMutation({
    mutationFn: async function ({
      status,
      orderId,
    }: {
      status: string;
      orderId: string;
    }) {
      let url = "/api/v2/order/update-order-status-admin/" + orderId;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      return null;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["admin-order-detail"],
      });
      await qc.invalidateQueries({
        queryKey: ["admin-all-orders"],
      });
      toast.success("Order updates successfully!");
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  });
  return { mutationStatus, mutateOrder };
}
