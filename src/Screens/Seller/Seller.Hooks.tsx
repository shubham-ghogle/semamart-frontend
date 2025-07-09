import { QueryFunction, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order, Product } from "../../Types/types";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

export async function getOrdersForSeller(id: string) {
  const res = await fetch(
    "/api/v2/order/get-seller-all-orders/" + id,
  );

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

export async function getProductsForSeller(id?: string) {
  if (!id) return
  const res = await fetch(
    "/api/v2/product/get-all-products-shop/" + id,
  );

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

export async function getOrderDetails(orderId?: string) {
  if (!orderId) throw new Error("Something went wrong")

  const res = await fetch("/api/v2/order/get-order-details/" + orderId)

  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message);
  }

  const data = (await res.json()) as { message: string, success: boolean, order: Order };

  if (!data.success) throw new Error(data.message);
  return data.order;
}


export function useSellerOrderMutation() {
  const qc = useQueryClient()

  const { status: mutationStatus, mutateAsync: mutateOrder } = useMutation({
    mutationFn: async function ({ status, currentStatus, orderId }
      : { status: string; currentStatus: string; orderId: string }) {
      let url = "/api/v2/order/order-refund-success/" + orderId

      if (currentStatus !== "Processing refund") {
        url = "/api/v2/order/update-order-status/" + orderId
      }
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error

      return null
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["seller-order-detail"]
      })
      await qc.invalidateQueries({
        queryKey: ["seller-orders"],
        refetchType: 'all'
      })
      toast.success("Order updates successfully!")
    },
    onError: () => {
      toast.error("Something went wrong!")
    }
  })

  return { mutationStatus, mutateOrder }
}

export function useCustomEnsureQuerty<T>(qkey: (string | undefined)[],
  qFunc: QueryFunction,
  id?: string) {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<"success" | "error" | "pending">("pending")

  const qc = useQueryClient()

  useEffect(() => {
    if (!id) return

    async function z() {
      try {
        const a = await qc.ensureQueryData({ queryKey: qkey, queryFn: qFunc })
        if (!a) {
          setStatus("error")
          return
        }
        setData(a as T)
        setStatus("success")
      } catch (err) {
        console.log(err)
        setStatus("error")
      }
    }
    setStatus("pending")
    z()
  }, [id])

  return { data, status }
}
