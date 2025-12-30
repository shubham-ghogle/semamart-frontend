import { useQuery } from "@tanstack/react-query";
import { getAllSellers } from "./Admin.HooksAndUtils";
import AdminRequestTable from "../../components/Admin/AdminRequest/AdminRequestTable";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";
import { Seller } from "../../Types/types";

export default function AdminRequestScreen() {
  const { data, error, status } = useQuery({
    queryKey: ["sellerRequests"],
    queryFn: getAllSellers,
  });

  // ✅ FILTER HERE (safe, local)
  const unverifiedSellers: Seller[] =
    status === "success" && data
      ? data.sellers.filter((s) => s.verified === false)
      : [];

  return (
    <AdminMainWrapper
      status={status}
      heading="Seller Registration Requests"
      errorMeassage={error?.message}
    >
      {status === "success" && (
        <AdminRequestTable sellers={unverifiedSellers} />
      )}
    </AdminMainWrapper>
  );
}
