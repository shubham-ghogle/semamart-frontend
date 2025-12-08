import { Product } from "@/Types/types";
import { DataTable } from "../ui/data-table";
import { Link } from "react-router";
import { AiOutlineEdit,  } from "react-icons/ai";
import { ColumnDef } from "@tanstack/react-table";
import { API_URL, BASE_URL } from "../../data";
import UpdateCommissionDialog from "./UpdateCommissionDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "../ui/switch";
import { ScreenOverlayLoaderUi } from "../UIComponents/LoaderUi";
import { toast } from "react-toastify";

type VariantRow = {
  id: string;
  productName: string;
  thumbnail: string;
  colorOption?: string;
  size?: string;
  stock: number;
  originalPrice: number;
  discountPrice: number;
  createdAt: string;
  productId: string;
  sku: string;
  commission: number;
  commissionHistoryDate: string;
  commissionHistoryAmount: number;
  sellerVisibility: boolean;
  adminVisibility: boolean;
};

type AdminAllProductTableProps = {
  products: Product[];
};

export default function AdminAllProductTable({
  products,
}: AdminAllProductTableProps) {
  const rows: VariantRow[] = products.flatMap((pro) =>
    pro.variants.map((v) => ({
      id: v._id,
      productName: pro.name,
      sku: pro.sku,
      thumbnail: BASE_URL + "images/" + v.thumbnail,
      colorOption: v.colorOption || "-",
      size: v.size || "-",
      stock: v.stock,
      originalPrice: v.originalPrice,
      discountPrice: v.discountPrice ?? 0,
      createdAt: new Date(pro.createdAt).toLocaleDateString("en-IN"),
      productId: pro._id,
      commission: pro.commission || 0,
      commissionHistoryDate: pro.commissionHistory?.[
        pro.commissionHistory.length - 1
      ].updatedAt
        ? new Date(
            pro.commissionHistory?.[pro.commissionHistory.length - 1].updatedAt,
          ).toLocaleDateString("en-IN")
        : "-",
      commissionHistoryAmount:
        pro.commissionHistory?.[pro.commissionHistory?.length - 1].commission ||
        0,
      adminVisibility: pro.visibilityByAdmin,
      sellerVisibility: pro.visibilityBySeller,
    })),
  );

  const columns: ColumnDef<VariantRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "adminVisibility",
      header: "Admin Visibility",
      cell: ({ row }) => (
        <section>
          <article>
            <Switch
              id="admin-prodcut-visibiity"
              checked={row.original.adminVisibility}
              onCheckedChange={(e) => {
                mutateVisibility({
                  proIds: [row.original.productId],
                  isVisible: e,
                });
              }}
              disabled={status === "pending"}
            />
          </article>
        </section>
      ),
    },
    {
      accessorKey: "sellerVisibility",
      header: "Seller Visibility",
      cell: ({ row }) => (
        <section>
          <article>
            <Switch
              id="seller-prodcut-visibiity"
              checked={row.original.sellerVisibility}
              disabled
            />
          </article>
        </section>
      ),
    },
    {
      accessorKey: "productName",
      header: "Product Name",
      cell: ({ row }) => (
        <p className="max-w-xs text-ellipsis overflow-hidden">
          {row.original.productName}
        </p>
      ),
    },
    { accessorKey: "sku", header: "SKU" },
    {
      accessorKey: "thumbnail",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.thumbnail}
          alt="thumb"
          className="w-12 h-12 object-cover rounded"
        />
      ),
    },
    { accessorKey: "colorOption", header: "Color" },
    { accessorKey: "size", header: "Size" },
    { accessorKey: "stock", header: "Stock" },
    { accessorKey: "originalPrice", header: "Price" },
    { accessorKey: "discountPrice", header: "Discount Price" },
    {
      accessorKey: "createdAt",
      header: "Created On",
    },
    {
  accessorKey: "commission",
  header: () => (
    <span className="flex items-center gap-1">
     Commission
    </span>
  ),
  cell: ({ row }) => (
    <span className="flex items-center gap-1">

      {row.original.commission}
    </span>
  ),
},

    {
      accessorKey: "commissionHistory",
      header: "Commission History",
      cell: ({ row }) => (
        <p>
          <span>Previous Amount: {row.original.commissionHistoryAmount}</span>{" "}
          <span>Updated At: {row.original.commissionHistoryDate}</span>
        </p>
      ),
    },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <article className="flex items-center gap-4">
          {/* <Link to={`/admin/products/view/${row.original.productId}`}> */}
          <Link to={"view/" + row.original.productId}>
            <AiOutlineEdit size={20} />
          </Link>
          <UpdateCommissionDialog
            currentCommission={row.original.commission}
            productId={row.original.productId}
          />
        </article>
      ),
    },
  ];

  const qc = useQueryClient();
  const { mutate: mutateVisibility, status } = useMutation({
    mutationFn: (data: { proIds: string[]; isVisible: boolean }) =>
      updateVisibility(data.proIds, data.isVisible),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["seller-products"],
      });
    },
    onError(error) {
      qc.invalidateQueries({
        queryKey: ["seller-products"],
      });
      toast.error(error.message);
    },
  });

  return (
    <div className="p-4 w-full">
      <DataTable
        data={rows}
        columns={columns}
        docName="products"
        disabeAdminVisibilitySwitch={false}
        onVisibilityChange={(proIds: string[], isVisible: boolean) =>
          mutateVisibility({ isVisible: isVisible, proIds: proIds })
        }
      />
      {status === "pending" && <ScreenOverlayLoaderUi />}
    </div>
  );
}

async function updateVisibility(productIds: string[], isVisible: boolean) {
  const res = await fetch(API_URL + "product/admin-visibility", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds, isVisible }),
  });

  if (!res.ok) {
    throw new Error("Could not update");
  }
  return res;
}
