import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";
import AdminOrderTable from "@/components/Admin/AdminOrderTable";
import { getDisplayOrderStatus, getOrderStatusBucket } from "@/lib/orderStatus";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUndoAlt,
} from "react-icons/fa";
import { getAllOrders } from "./Admin.HooksAndUtils";

type StatusFilter =
  | "All"
  | "Pending"
  | "Processing"
  | "Delivered"
  | "Cancelled"
  | "Return";

export default function CurrentOrderStatusScreen() {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");

  const { data, status, error } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: getAllOrders,
  });

  const orders = data?.orders ?? [];

  const counts = useMemo(
    () =>
      orders.reduce<Record<StatusFilter, number>>(
        (acc, order) => {
          const bucket = getOrderStatusBucket(order);
          acc.All += 1;
          if (bucket === "Pending") acc.Pending += 1;
          if (bucket === "Processing") acc.Processing += 1;
          if (bucket === "Delivered") acc.Delivered += 1;
          if (bucket === "Cancelled") acc.Cancelled += 1;
          if (bucket === "Return") acc.Return += 1;
          return acc;
        },
        {
          All: 0,
          Pending: 0,
          Processing: 0,
          Delivered: 0,
          Cancelled: 0,
          Return: 0,
        },
      ),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    if (selectedStatus === "All") return orders;
    return orders.filter((order) => getOrderStatusBucket(order) === selectedStatus);
  }, [orders, selectedStatus]);

  const statusCards = [
    {
      label: "Delivered" as const,
      count: counts.Delivered,
      color: "from-emerald-500 to-green-600",
      icon: <FaCheckCircle className="text-2xl lg:text-4xl" />,
    },
    {
      label: "Cancelled" as const,
      count: counts.Cancelled,
      color: "from-rose-500 to-red-600",
      icon: <FaTimesCircle className="text-2xl lg:text-4xl" />,
    },
    {
      label: "Return" as const,
      count: counts.Return,
      color: "from-amber-500 to-orange-600",
      icon: <FaUndoAlt className="text-2xl lg:text-4xl" />,
    },
    {
      label: "Processing" as const,
      count: counts.Processing,
      color: "from-indigo-500 to-blue-600",
      icon: <FaBoxOpen className="text-2xl lg:text-4xl" />,
    },
    {
      label: "Pending" as const,
      count: counts.Pending,
      color: "from-sky-500 to-cyan-600",
      icon: <FaClock className="text-2xl lg:text-4xl" />,
    },
  ];

  const filterOptions: StatusFilter[] = [
    "All",
    "Pending",
    "Processing",
    "Delivered",
    "Cancelled",
    "Return",
  ];

  return (
    <AdminMainWrapper
      status={status as "pending" | "success" | "error"}
      heading="Current Order Status"
      subHeading="Track current order buckets and review matching orders"
      errorMeassage={error instanceof Error ? error.message : undefined}
    >
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
            </button>
          ))}
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

        <AdminOrderTable
          orders={filteredOrders}
          docName="current-order-status"
          searchPlaceholder="Search by order id"
          enableStatusFilter={false}
          emphasizeStatus
          statusResolver={getDisplayOrderStatus}
        />
      </div>
    </AdminMainWrapper>
  );
}
