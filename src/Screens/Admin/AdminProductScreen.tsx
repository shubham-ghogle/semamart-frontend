import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";
import { TableBodyCell, TableHeader, TableImageCell, TableWrapper } from "../../components/UI/Table";
import { formatDate } from "../../components/UI/Inputs";
import { getAdminProducts } from "./Admin.HooksAndUtils";
import { toast } from "react-toastify";
import { Link } from "react-router";
import { AiOutlineEye } from "react-icons/ai";

export default function AdminProductScren() {
  const qc = useQueryClient()

  const { data: products, status, error } = useQuery({
    queryKey: ["admin-products"],
    queryFn: getAdminProducts
  })

  const headers = ["Product Name", "Image", "SKU", "Stocks", "Original Price", "Discounted Price", "Type", "Added on", "Status", "Actions"];

  const { mutateAsync: mutateProduct, status: proVerifyStatus } = useMutation({
    mutationFn: async function ({ proId }: { proId: string }) {
      const res = await fetch("/api/v2/product/admin/verify-product/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proId })
      })
      if (!res.ok) throw new Error("Something went wrong")
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin-products"],
      })
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  })

  return (
    <AdminMainWrapper heading="Product Requets" status={status} errorMeassage={error?.message}>
      {status === "success" && products && (
        <TableWrapper>
          <TableHeader headers={headers} />
          <tbody>
            {products.map(pro => (
              <tr key={pro._id}>
                <TableBodyCell text={pro.name} />
                <TableImageCell src={"/baseUrl" + "/" + pro.images[0]} />
                <TableBodyCell text={pro.sku || ""} />
                <TableBodyCell text={pro.stock.toString()} />
                <TableBodyCell text={pro.originalPrice.toString()} />
                <TableBodyCell text={pro.discountPrice.toString()} />
                <TableBodyCell text={pro.productType} />
                <TableBodyCell text={formatDate(pro.createdAt)} />
                <TableBodyCell text={pro.productStatus} />
                <td align="center">
                  <div className="flex items-center justify-center gap-2 px-2">
                    <button>
                      <Link to="#">
                        <AiOutlineEye size={20} />
                      </Link>
                    </button>
                    {pro.productStatus === "offline" && (
                      <button
                        onClick={() => mutateProduct({ proId: pro._id })}
                        className="bg-green-500 py-1 px-2 rounded-sm text-white text-sm disabled:bg-gray-700"
                        disabled={proVerifyStatus === "pending"}
                      >
                        {proVerifyStatus === "pending" ? "Wait..." : "Verify"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      )
      }
    </AdminMainWrapper >
  )
}
