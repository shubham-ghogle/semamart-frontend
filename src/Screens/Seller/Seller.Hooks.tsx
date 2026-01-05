import { QueryFunction, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order, Product } from "../../Types/types";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { redirect } from "react-router"; // ✅ added for route protection
import { API_URL } from "@/data";

// 🔒 AUTH GUARD — ensures only logged-in sellers can access /seller pages
export function requireSellerAuth() {
  const seller = localStorage.getItem("seller-storage");
  if (!seller) {
    // redirect unauthenticated seller to seller login/register
    return redirect("/login");
  }
  return null;
}

// ✅ Fetch all seller orders
export async function getOrdersForSeller(id: string) {
  const res = await fetch(API_URL+"order/get-seller-all-orders/" + id,{
    credentials:"include"
  });

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

// ✅ Fetch all products for a seller
export async function getProductsForSeller(id?: string) {
  if (!id) return;
  const res = await fetch(API_URL+"product/get-all-products-shop/" + id,{
    credentials:"include"
  });

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

// ✅ Fetch specific order details for a seller
export async function getOrderDetails(orderId?: string) {
  if (!orderId) throw new Error("Something went wrong");

  const res = await fetch(API_URL+"order/get-order-details-seller/" + orderId);

  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message);
  }

  const data = (await res.json()) as Order;
  return data;
}

// ✅ Mutation hook for updating or refunding order status
export function useSellerOrderMutation() {
  const qc = useQueryClient();

  const { status: mutationStatus, mutateAsync: mutateOrder } = useMutation({
    mutationFn: async function ({
      status,
      currentStatus,
      orderId,
    }: {
      status: string;
      currentStatus: string;
      orderId: string;
    }) {
      let url = API_URL+ "order/order-refund-success/" + orderId;

      if (currentStatus !== "Processing refund") {
        url = API_URL+ "order/update-order-status/" + orderId;
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials:"include"
      });

      if (!res.ok) throw new Error();

      return null;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["seller-order-detail"] });
      await qc.invalidateQueries({
        queryKey: ["seller-orders"],
        refetchType: "all",
      });
      toast.success("Order updated successfully!");
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  });

  return { mutationStatus, mutateOrder };
}

// ✅ Utility hook to ensure query data exists (with error + pending state)
export function useCustomEnsureQuerty<T>(
  qkey: (string | undefined)[],
  qFunc: QueryFunction,
  id?: string
) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<"success" | "error" | "pending">("pending");

  const qc = useQueryClient();

  useEffect(() => {
    if (!id) return;

    async function z() {
      try {
        const a = await qc.ensureQueryData({ queryKey: qkey, queryFn: qFunc });
        if (!a) {
          setStatus("error");
          return;
        }
        setData(a as T);
        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    setStatus("pending");
    z();
  }, [id]);

  return { data, status };
}
