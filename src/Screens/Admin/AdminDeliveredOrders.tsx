import { useQuery } from "@tanstack/react-query";
import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";
import AdminDeliveredOrderTable from "@/components/Admin/AdminDeliveredOrderTable";
import { getAllOrders } from "./Admin.HooksAndUtils";

const formatMoney = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);

export default function AdminDeliveredOrders() {
  const { data, status } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: getAllOrders,
  });

  const deliveredOrders =
    data?.orders?.filter((o) => o.status === "Delivered") ?? [];

  const totals = deliveredOrders.reduce(
    (acc, o) => {
      const pid =
        typeof o.variant === "object" ? (o.variant as any)?.productId : null;

      const commission =
        pid && typeof pid === "object" ? pid.commission ?? 0 : 0;

      const commissionAmount = commission;

      acc.totalSales += o.totalPrice || 0;
      acc.totalCommission += commissionAmount;
      acc.totalRevenue += (o.totalPrice || 0) - commissionAmount;

      return acc;
    },
    {
      totalSales: 0,
      totalCommission: 0,
      totalRevenue: 0,
    }
  );
  return (
    <AdminMainWrapper
      status={status as any}
      heading="Total Sales"
      subHeading="Sales for orders that have been delivered"
    >
      <div className="flex justify-end gap-4 mb-6">
        <div className="bg-yellow-100 text-yellow-900 px-5 py-3 rounded-xl font-semibold text-lg">
          Total Sales: {formatMoney(totals.totalSales)}
        </div>

        <div className="bg-yellow-100 text-yellow-900 px-5 py-3 rounded-xl font-semibold text-lg">
          Platform Fee: {formatMoney(totals.totalCommission)}
        </div>

        <div className="bg-yellow-100 text-yellow-900 px-5 py-3 rounded-xl font-semibold text-lg">
          Net Revenue: {formatMoney(totals.totalRevenue)}
        </div>
      </div>

      <AdminDeliveredOrderTable orders={deliveredOrders} />
    </AdminMainWrapper>
  );
}
