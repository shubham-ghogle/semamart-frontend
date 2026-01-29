import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import SellerDeliveredOrderTable from "../../components/Seller/SellerDeliveredOrderTable";
import { useQuery } from "@tanstack/react-query";
import { getDeliveredOrdersForSeller } from "./Seller.Hooks";
import { Order } from "../../Types/types";

const formatMoney = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);

export default function SellerDeliveredOrders() {
  const {
    data: orders,
    status,
    error,
  } = useQuery<Order[]>({
    queryKey: ["seller-delivered-orders"],
    queryFn: getDeliveredOrdersForSeller,
  });

  const deliveredOrders =
    orders?.filter((o) => o.status === "Delivered") ?? [];

  const totals = deliveredOrders.reduce(
    (acc, o) => {
      const pid =
        typeof o.variant === "object" ? (o.variant as any)?.productId : null;

      const commission =
        pid && typeof pid === "object" ? pid.commission ?? 0 : 0;

      const orderTotal = o.totalPrice || 0;

      // ✅ CORRECT commission calculation
      const commissionAmount = commission * (o.qty ?? 0);

      acc.totalSales += orderTotal;
      acc.totalCommission += commissionAmount;
      acc.totalRevenue += orderTotal - commissionAmount;

      return acc;
    },
    {
      totalSales: 0,
      totalCommission: 0,
      totalRevenue: 0,
    }
  );

  return (
    <SellerMainWrapper
      status={status as any}
      errorMessage={(error as Error)?.message || "Something went wrong"}
      heading="Total Sales"
      subHeading="Sales for orders that have been delivered"
    >
      {status === "success" && (
        <>
          <div className="flex justify-end gap-4 mb-6">
            <div className="bg-yellow-100 text-yellow-900 px-5 py-3 rounded-xl font-semibold text-lg">
              Total Sales: {formatMoney(totals.totalSales)}
            </div>

            <div className="bg-yellow-100 text-yellow-900 px-5 py-3 rounded-xl font-semibold text-lg">
              Net Revenue: {formatMoney(totals.totalRevenue)}
            </div>
          </div>

          {/* ✅ Pass ONLY delivered orders */}
          <SellerDeliveredOrderTable orders={deliveredOrders} />
        </>
      )}
    </SellerMainWrapper>
  );
}
