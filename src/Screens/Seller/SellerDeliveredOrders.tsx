import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import SellerOrderTable from "../../components/Seller/SellerOrderTable";
import { useQuery } from "@tanstack/react-query";
import {
  getDeliveredOrdersForSeller,
  getSellerDashboardStats,
} from "./Seller.Hooks";
import { Order } from "../../Types/types";

export default function SellerDeliveredOrders() {
  const {
    data: orders,
    status: orderStatus,
    error: orderError,
  } = useQuery<Order[]>({
    queryKey: ["seller-delivered-orders"],
    queryFn: getDeliveredOrdersForSeller,
  });

  const {
    data: stats,
    status: statsStatus,
    error: statsError,
  } = useQuery({
    queryKey: ["seller-dashboard-stats"],
    queryFn: getSellerDashboardStats,
  });

  const isSuccess = orderStatus === "success" && statsStatus === "success";
  const isError = orderStatus === "error" || statsStatus === "error";

  const formatMoney = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  return (
    <SellerMainWrapper
      status={isSuccess ? "success" : isError ? "error" : "pending"}
      errorMessage={
        (orderError as Error)?.message ||
        (statsError as Error)?.message ||
        "Something went wrong"
      }
      heading="Delivered Orders"
    >
      {isSuccess && (
        <>
          <div className="mb-6 flex justify-end">
            <span className="text-lg bg-yellow-100 p-4 rounded-xl text-yellow-900 sm:text-xl font-semibold">
              Total Sales • {formatMoney(stats.totalSales)}
            </span>
          </div>

          <SellerOrderTable orders={orders ?? []} />
        </>
      )}
    </SellerMainWrapper>
  );
}
