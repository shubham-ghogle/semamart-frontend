import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { getAdminOrderDetails } from "./Admin.HooksAndUtils";
import AdminOrderDetail from "@/components/Admin/AdminOrderDetail";

export default function AdminOrderDetailsScreen() {
  const { orderId } = useParams();

  const {
    data,
    status: orderStatus,
    error,
  } = useQuery({
    queryKey: ["admin-order-detail", { orderId }],
    queryFn: () => getAdminOrderDetails(orderId),
    enabled: !!orderId,
  });

  return (
    <AdminMainWrapper
      status={orderStatus}
      heading="Order Details"
      errorMeassage={error?.message}
    >
      {data && <AdminOrderDetail data={data}/>}
    </AdminMainWrapper>
  );
}
