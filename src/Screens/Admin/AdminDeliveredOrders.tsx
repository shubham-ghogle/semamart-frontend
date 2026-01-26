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

  const totalSales = deliveredOrders.reduce(
    (sum, o) => sum + (o.totalPrice || 0),
    0
  );

  return (
    <AdminMainWrapper
      status={status as any}
      heading="Total Sales"
      subHeading="Sales for orders that have been delivered"
    >
      <div className="flex justify-end mb-6">
        <div className="bg-yellow-100 text-yellow-900 px-5 py-3 rounded-xl font-semibold text-lg">
          Total Sales: {formatMoney(totalSales)}
        </div>
      </div>

      <AdminDeliveredOrderTable orders={deliveredOrders} />
    </AdminMainWrapper>
  );
}
