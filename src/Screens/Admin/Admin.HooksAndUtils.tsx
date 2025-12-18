import { redirect } from "react-router";
import { Order, Product, Seller } from "../../Types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { API_URL } from "@/data";

export type AdminSellersApiRes =
  | { success: true; sellers: Seller[] }
  | { success: false; message: string };

export async function getAllSellers(): Promise<{ sellers: Seller[] }> {
  const response = await fetch(API_URL+"shop/admin-all-sellers",{
    credentials:"include"
  });
  if (!response.ok) {
    const errMessage = await response.json();
    throw new Error(errMessage.message || "Failed to fetch sellers");
  }

  const data = (await response.json()) as AdminSellersApiRes;
  if (!data.success) throw new Error(data.message);
  return { sellers: data.sellers };
}

export async function getSellerById(id: string): Promise<{ seller: Seller }> {
  const res = await fetch(`${API_URL}shop/admin-seller/${id}`,{
    credentials:"include"
  });
  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message || "Failed to fetch seller");
  }

  const data = (await res.json()) as
    | { success: true; seller: Seller }
    | { success: false; message: string };

  if (!data.success) throw new Error(data.message);
  return { seller: data.seller };
}


export async function getVerifiedSellers(): Promise<{ sellers: Seller[] }> {
  const res = await fetch(API_URL+"shop/admin-verified-sellers",{
    credentials:"include"
  });
  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message || "Failed to fetch verified sellers");
  }

  const data = (await res.json()) as AdminSellersApiRes;
  if (!data.success) throw new Error(data.message);
  return { sellers: data.sellers };
}

export async function deleteSeller(id: string) {
  const res = await fetch(`${API_URL}shop/delete-seller/${id}`, {
    method: "DELETE",
    credentials:"include"
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
  const response = await fetch(API_URL+"order/admin-all-orders", {
    credentials:"include"
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
  const res = await fetch(API_URL+"product/admin-all-products", {
    credentials:"include"
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
  const res = await fetch(API_URL+"user/admin-all-users", {
    credentials:"include"
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
  const res = await fetch(`${API_URL}user/delete-user/${id}`, {
    method: "DELETE",
    credentials:"include"
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

  const res = await fetch(API_URL+"order/get-order-details-admin/" + orderId,{
    credentials:"include"
  });

  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message);
  }

  const data = (await res.json()) as Order;

  return data;
}

export function useAdminOrderMutation(onSuccessFn?:()=>void) {
  const qc = useQueryClient();

  const { status: mutationStatus, mutateAsync: mutateOrder } = useMutation({
    mutationFn: async function ({
      status,
      orderId,
    }: {
      status: string;
      orderId: string;
    }) {
      const url = API_URL+"order/update-order-status-admin/" + orderId;

      const res = await fetch(url, {
        method: "PUT",
        credentials:"include",
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

      if(onSuccessFn){
        onSuccessFn()
      }
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  });
  return { mutationStatus, mutateOrder };
}

export interface DashboardSummary {
  newVendors: number;
  vendors: number;
  vendorTrend: string; // percentage string, e.g. "12.3"
  newInstitutes: number;
  institutes: number;
  instituteTrend: string;
  newOrders: number;
  orders: number;
  orderTrend: string;
  monthlyOrders: { month: string; orders: number }[];
}

export interface DashboardSummaryApiRes {
  success: boolean;
  data: DashboardSummary;
}

export async function getAdminDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(API_URL+"adminsummary/admin-dashboard-summary", {
    credentials:"include"
  });

  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message || "Failed to fetch dashboard summary");
  }

  const data = (await res.json()) as DashboardSummaryApiRes;
  if (!data.success) throw new Error("Failed to fetch dashboard summary");
  return data.data;
}
