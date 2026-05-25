import SellerMainWrapper from "@/components/Seller/SellerMainWrapper";
import SellerOrderTable from "@/components/Seller/SellerOrderTable";
import {
  getOrderAnalytics,
  getStatusFilteredOrders,
  OrderStatusFilter,
} from "@/lib/orderAnalytics";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaReceipt,
  FaTimesCircle,
  FaUndoAlt,
} from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { getOrdersForSeller } from "./Seller.Hooks";
import { useSellerSession } from "./sellerSession";

type ScreenStatus = "pending" | "success" | "error";

export default function SellerCurrentOrderStatusScreen() {
  const { shopId, canAccess } = useSellerSession();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusFilter>("All");

  const { data: orders = [], status, error } = useQuery({
    queryKey: ["seller-orders", shopId],
    queryFn: () => getOrdersForSeller(shopId || ""),
    staleTime: Infinity,
    enabled: canAccess("CurrentOrderStatus") && !!shopId,
  });

  const analytics = useMemo(() => getOrderAnalytics(orders), [orders]);
  const counts = analytics.counts;
  const filteredOrders = useMemo(
    () => getStatusFilteredOrders(orders, selectedStatus),
    [orders, selectedStatus],
  );

  const filterOptions: OrderStatusFilter[] = [
    "All",
    "Pending",
    "Processing",
    "Delivered",
    "Cancelled",
    "Return",
  ];

  const money = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const displayStatus: ScreenStatus = canAccess("CurrentOrderStatus")
    ? (status as ScreenStatus)
    : "success";

  const statusCards = [
    {
      label: "Delivered" as const,
      count: counts.Delivered,
      amount: analytics.statusMetrics.Delivered.amount,
      color: "from-emerald-500 to-green-600",
      icon: <FaCheckCircle className="text-2xl lg:text-4xl" />,
    },
    {
      label: "Cancelled" as const,
      count: counts.Cancelled,
      amount: analytics.statusMetrics.Cancelled.amount,
      color: "from-rose-500 to-red-600",
      icon: <FaTimesCircle className="text-2xl lg:text-4xl" />,
    },
    {
      label: "Return" as const,
      count: counts.Return,
      amount: analytics.statusMetrics.Return.amount,
      color: "from-amber-500 to-orange-600",
      icon: <FaUndoAlt className="text-2xl lg:text-4xl" />,
    },
    {
      label: "Processing" as const,
      count: counts.Processing,
      amount: analytics.statusMetrics.Processing.amount,
      color: "from-indigo-500 to-blue-600",
      icon: <FaBoxOpen className="text-2xl lg:text-4xl" />,
    },
    {
      label: "Pending" as const,
      count: counts.Pending,
      amount: analytics.statusMetrics.Pending.amount,
      color: "from-sky-500 to-cyan-600",
      icon: <FaClock className="text-2xl lg:text-4xl" />,
    },
  ];

  const summaryCards = [
    {
      label: "Gross Order Value",
      value: money(analytics.statusMetrics.All.amount),
      helper: `${counts.All} total orders`,
      icon: <FaMoneyBillWave className="text-xl text-emerald-600" />,
    },
    {
      label: "Recognized Revenue",
      value: money(analytics.deliveredRevenue),
      helper: `${counts.Delivered} delivered orders`,
      icon: <FaArrowTrendUp className="text-xl text-blue-600" />,
    },
    {
      label: "Average Order Value",
      value: money(analytics.averageOrderValue),
      helper: `${analytics.fulfillmentRate.toFixed(1)}% fulfillment rate`,
      icon: <FaReceipt className="text-xl text-violet-600" />,
    },
    {
      label: "Active Requests",
      value: analytics.activeRequestCount.toString(),
      helper: `${analytics.returnRate.toFixed(1)}% returns, ${analytics.cancellationRate.toFixed(1)}% cancellations`,
      icon: <FaUndoAlt className="text-xl text-amber-600" />,
    },
  ];

  return (
    <SellerMainWrapper
      status={displayStatus}
      heading="Current Order Status"
      errorMessage={error instanceof Error ? error.message : undefined}
    >
      {!canAccess("CurrentOrderStatus") ? (
        <div className="rounded-xl border bg-white p-4 text-gray-600">
          You do not have access to current order status analytics.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {statusCards.map((card) => (
              <button
                key={card.label}
                type="button"
                onClick={() => setSelectedStatus(card.label)}
                className={`rounded-xl bg-gradient-to-r ${card.color} p-4 text-left text-white shadow-md transition hover:scale-[1.02] ${
                  selectedStatus === card.label ? "ring-4 ring-black/10" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  {card.icon}
                  <span className="text-2xl font-bold lg:text-4xl">{card.count}</span>
                </div>
                <p className="mt-3 text-sm font-medium lg:text-base">{card.label} Orders</p>
                <p className="mt-1 text-sm text-white/85">{money(card.amount)}</p>
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 p-3">{card.icon}</div>
                </div>
                <p className="mt-3 text-sm text-slate-500">{card.helper}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">Status amount breakdown</h2>
              <p className="text-sm text-slate-500">Track your order load and value by current workflow stage</p>
              <div className="mt-5 space-y-4">
                {filterOptions.slice(1).map((filter) => {
                  const metric = analytics.statusMetrics[filter];
                  const share = counts.All ? (metric.count / counts.All) * 100 : 0;
                  return (
                    <div key={filter}>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <div>
                          <p className="font-medium text-slate-800">{filter}</p>
                          <p className="text-slate-500">
                            {metric.count} orders • {money(metric.amount)}
                          </p>
                        </div>
                        <span className="font-semibold text-slate-700">{share.toFixed(1)}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#1C647C]"
                          style={{ width: `${Math.max(share, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">Top performing products</h2>
              <p className="text-sm text-slate-500">Best sellers ranked by recognized revenue and delivery outcome</p>
              <div className="mt-5 space-y-4">
                {analytics.topProducts.length === 0 ? (
                  <p className="text-sm text-slate-500">No product performance data available yet.</p>
                ) : (
                  analytics.topProducts.map((product, index) => (
                    <div key={`${product.productId}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-800">{product.productName}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {product.orderCount} orders • {product.unitsSold} units sold
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{money(product.revenue)}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-white px-2.5 py-1">Gross {money(product.grossAmount)}</span>
                        <span className="rounded-full bg-white px-2.5 py-1">Returns {product.returnCount}</span>
                        <span className="rounded-full bg-white px-2.5 py-1">Cancelled {product.cancelCount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Filter by order status</h2>
                <p className="text-sm text-slate-500">
                  Showing {filteredOrders.length} of {counts.All} orders
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedStatus(filter)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedStatus === filter
                        ? "bg-[#1C647C] text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {filter} ({counts[filter]})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SellerOrderTable orders={filteredOrders} />
        </div>
      )}
    </SellerMainWrapper>
  );
}
