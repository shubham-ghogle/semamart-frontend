import { useQuery } from "@tanstack/react-query";
import { getAllSellers } from "./Admin.HooksAndUtils";
import AdminRequestTable from "../../components/Admin/AdminRequest/AdminRequestTable";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";

export default function AdminRequestScreen() {
  const { data, error, status } = useQuery({
    queryKey: ["sellerRequests"],
    queryFn: getAllSellers,
  });

  return (
    <AdminMainWrapper
      status={status}
      heading="Seller Regitration Requests"
      errorMeassage={error?.message}
    >
      {status === "success" && data && (
        <AdminRequestTable sellers={data.sellers} />
      )}
    </AdminMainWrapper>
  );
}
