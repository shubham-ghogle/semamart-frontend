import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "./Admin.HooksAndUtils";
import AdminOrderTable from "@/components/Admin/AdminOrderTable";

export default function AllOrderScreen() {
  const { error, status, data } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: getAllOrders,
  });

  return (
    <AdminMainWrapper
      status={status}
      heading="All Orders"
      errorMeassage={error?.message}
    >
      {data && <AdminOrderTable orders={data?.orders} />}
    </AdminMainWrapper>
  );
}
