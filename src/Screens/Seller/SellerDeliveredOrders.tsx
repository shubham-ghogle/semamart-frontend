import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import SellerDeliveredOrderTable from "../../components/Seller/SellerDeliveredOrderTable";
import { useQuery } from "@tanstack/react-query";
import { getDeliveredOrdersForSeller } from "./Seller.Hooks";
import { Order } from "../../Types/types";
import { useSellerSession } from "./sellerSession";
import { getVariantCommission } from "@/lib/utils";

const formatMoney = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);

export default function SellerDeliveredOrders() {
  const { shopId, canAccess } = useSellerSession();
  const {
    data: orders,
    status,
    error,
  } = useQuery<Order[]>({
    queryKey: ["seller-delivered-orders", shopId],
    queryFn: getDeliveredOrdersForSeller,
    enabled: !!shopId,
  });
  const displayStatus = canAccess("AllSales") ? status : "success";

  const deliveredOrders = orders?.filter((o) => o.status === "Delivered") ?? [];

  const totals = deliveredOrders.reduce(
    (acc, o) => {
      const commission = getVariantCommission(o);

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
    },
  );

  return (
    <SellerMainWrapper
      status={displayStatus as any}
      errorMessage={(error as Error)?.message || "Something went wrong"}
      heading="Total Sales"
      subHeading="Sales for orders that have been delivered"
    >
      {!canAccess("AllSales") ? (
        <div className="rounded-xl border bg-white p-4 text-gray-600">You do not have access to sales data.</div>
      ) : status === "success" && (
        <>
          <div className="flex justify-end gap-4 mb-6">
            {/* Updated to Semamart Teal with white text */}
            <div className="bg-[#006666] text-white px-5 py-3 rounded-xl font-semibold text-lg shadow-sm">
              Total Sales: {formatMoney(totals.totalSales)}
            </div>

            <div className="bg-[#006666] text-white px-5 py-3 rounded-xl font-semibold text-lg shadow-sm">
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
