// src/pages/seller/SellerDashboard.tsx
import { AiOutlineProduct } from "react-icons/ai";
import { CiDeliveryTruck } from "react-icons/ci";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useQuery } from "@tanstack/react-query";
import {
  getDeliveredOrdersForSeller,
  getOrdersForSeller,
  getProductsForSeller,
} from "./Seller.Hooks";
import SellerOrderTable from "../../components/Seller/SellerOrderTable";
import { useNavigate } from "react-router-dom";
import { Coins } from "lucide-react";
import { getVariantCommission } from "@/lib/utils";
import { useSellerSession } from "./sellerSession";

type status = "pending" | "success" | "error";

export default function SellerDashboard() {
  const { shopId, canAccess } = useSellerSession();
  const navigate = useNavigate();

  const {
    data: orders,
    error: orderErr,
    status: orderStatus,
  } = useQuery({
    queryKey: ["seller-orders", shopId],
    queryFn: () => getOrdersForSeller(shopId || ""),
    staleTime: Infinity,
    enabled: !!shopId,
  });

  const {
    data: products,
    status: proStatus,
    error: proError,
  } = useQuery({
    queryKey: ["seller-products", shopId],
    queryFn: () => getProductsForSeller(shopId || ""),
    staleTime: Infinity,
    enabled: !!shopId,
  });

  const {
    data: deliveredOrdersData,
    status: deliveredStatus,
    error: deliveredErr,
  } = useQuery({
    queryKey: ["seller-delivered-orders", shopId],
    queryFn: getDeliveredOrdersForSeller,
    staleTime: 60 * 1000,
    enabled: !!shopId,
  });

  const isSuccess =
    orderStatus === "success" &&
    proStatus === "success" &&
    deliveredStatus === "success";

  const isError =
    orderStatus === "error" ||
    proStatus === "error" ||
    deliveredStatus === "error";

  let overAllStatus: status = "pending";
  if (isSuccess) overAllStatus = "success";
  else if (isError) overAllStatus = "error";

  const overAllError =
    proError?.message ||
    orderErr?.message ||
    (deliveredErr as Error | null)?.message ||
    "Something went wrong";
  const displayStatus: status = canAccess("Dashboard") ? overAllStatus : "success";

  const deliveredOrders =
    deliveredOrdersData?.filter((o: any) => o.status === "Delivered") ?? [];

  const totals = deliveredOrders.reduce(
    (acc: { totalSales: number; totalRevenue: number }, order: any) => {
      const commissionPerUnit = getVariantCommission(order);
      const orderTotal = order.totalPrice || 0;
      const commissionAmount = commissionPerUnit * (order.qty ?? 0);

      acc.totalSales += orderTotal;
      acc.totalRevenue += orderTotal - commissionAmount;
      return acc;
    },
    { totalSales: 0, totalRevenue: 0 },
  );

  const variants = products?.flatMap((p: any) => p.variants) || [];

  // Items arranged to match Admin cards look & behavior
  const CARDS = [
    {
      key: "products",
      label: "All Products",
      // admin color: from-blue-500 to-indigo-500
      color: "from-blue-500 to-indigo-500",
      Icon: AiOutlineProduct,
      value: variants?.length ?? 0,
      onClick: () => navigate("products"),
    },
    {
      key: "orders",
      label: "All Orders",
      // admin color: from-green-500 to-emerald-500
      color: "from-green-500 to-emerald-500",
      Icon: CiDeliveryTruck,
      value: orders?.length ?? 0,
      onClick: () => navigate("orders"),
    },
    {
      key: "balance",
      label: "Total Sales",
      // admin color: from-yellow-500 to-orange-500
      color: "from-yellow-500 to-orange-500",
      Icon: Coins,
      value: totals.totalSales,
      onClick: () => navigate("/seller/orders/delivered"),
    },
    {
      key: "revenue",
      label: "Net Revenue",
      // admin color: from-pink-500 to-rose-500
      color: "from-pink-500 to-rose-500",
      Icon: Coins,
      value: totals.totalRevenue,
      onClick: () => navigate("/seller/orders/delivered"),
    },
  ];

  const formatMoney = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  return (
    <SellerMainWrapper
      status={displayStatus}
      errorMessage={overAllError}
      heading="Seller Dashboard"
    >
      {!canAccess("Dashboard") ? (
        <div className="rounded-xl border bg-white p-4 text-gray-600">You do not have access to the dashboard.</div>
      ) : isSuccess && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-full mx-auto">
            {CARDS.map((c) => {
              const Icon = c.Icon as any;
              return (
                <div
                  key={c.key}
                  onClick={c.onClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && c.onClick()
                  }
                  className={`bg-gradient-to-r ${c.color} text-white rounded-2xl p-6 shadow-lg cursor-pointer relative overflow-hidden hover:scale-105 transition-transform`}
                >
                  <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-8 -translate-y-8" />
                  <div className="flex items-center justify-between relative z-10">
                    <Icon className="text-4xl text-white" />
                    <span className="text-3xl font-bold">
                      {["balance", "fees", "revenue"].includes(c.key)
                        ? formatMoney(Number(c.value))
                        : c.value}
                    </span>
                  </div>
                  <p className="text-lg mt-4 font-medium">{c.label}</p>
                  {/* placeholder for monthly trend; keep for parity with admin cards */}
                  <p className="text-sm mt-2 text-white/80">Overview</p>
                </div>
              );
            })}
          </section>

          <section className="mt-8">
            <h2 className="text-center text-2xl mb-4 text-gray-800 font-semibold">
              Recent Orders
            </h2>
            <div className="bg-white rounded-lg shadow p-4">
              <SellerOrderTable orders={orders} />
            </div>
          </section>
        </>
      )}
    </SellerMainWrapper>
  );
}
