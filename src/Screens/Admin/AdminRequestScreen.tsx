import { useQuery } from "@tanstack/react-query";
import LoaderUi from "../../components/UI/LoaderUi";
import { getSellers } from "./Admin.HooksAndUtils";
import AdminRequestTable from "../../components/Admin/AdminRequest/AdminRequestTable";

export default function AdminRequestScreen() {
  const { data, error, status } = useQuery({
    queryKey: ["seller-requests"],
    queryFn: getSellers,
  });

  return (
    <article className="h-full p-4">
      {status === "pending" && <LoaderUi title="Loading..." />}
      {status === "error" && <LoaderUi title={error.message} />}
      {status === "success" && data && (
        <AdminRequestTable sellers={data.sellers} />
      )}
    </article>
  );
}
