import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";
import { getAdminProducts } from "./Admin.HooksAndUtils";
import { toast } from "react-toastify";
import AdminAllProductTable from "@/components/Admin/AdminAllProductTable";

export default function AdminProductScren() {
  const qc = useQueryClient();

  const {
    data: products,
    status,
    error,
  } = useQuery({
    queryKey: ["admin-products"],
    queryFn: getAdminProducts,
  });

  // const { mutateAsync: mutateProduct, status: proVerifyStatus } = useMutation({
  const {} = useMutation({
    mutationFn: async function ({ proId }: { proId: string }) {
      const res = await fetch("/api/v2/product/admin/verify-product/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proId }),
      });
      if (!res.ok) throw new Error("Something went wrong");
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin-products"],
      });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <AdminMainWrapper
      heading="Product Requests"
      status={status}
      errorMeassage={error?.message}
    >
      {products && (
        <div className="p-4 bg-white shadow rounded">
          <AdminAllProductTable products={products} />
        </div>
      )}
    </AdminMainWrapper>
  );
}

// <button
//   onClick={() => mutateProduct({ proId: pro._id })}
//   className="bg-green-500 py-1 px-2 rounded-xs text-white text-sm disabled:bg-gray-700"
//   disabled={proVerifyStatus === "pending"}
// >
//   {proVerifyStatus === "pending" ? "Wait..." : "Verify"}
// </button>
