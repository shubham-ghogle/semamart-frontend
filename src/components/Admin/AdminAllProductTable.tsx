import { Product } from "@/Types/types";
import { DataTable } from "../ui/data-table";
import { Link } from "react-router";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { ColumnDef } from "@tanstack/react-table";
import { API_URL, BASE_URL } from "../../data";
import UpdateCommissionDialog from "./UpdateCommissionDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "../ui/switch";
import { ScreenOverlayLoaderUi } from "../UIComponents/LoaderUi";
import { toast } from "react-toastify";
import DisplayCommission from "./DisplayCommission";

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
  commissionHistory: { updatedAt: string; commission: number }[];
};

type AdminAllProductTableProps = {
  products: Product[];
};

export default function AdminAllProductTable({
  products,
}: AdminAllProductTableProps) {
  const qc = useQueryClient();

  const { mutate: mutateVisibility, status } = useMutation({
    mutationFn: (data: { proIds: string[]; isVisible: boolean }) =>
      updateVisibility(data.proIds, data.isVisible),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-products"] });
    },
    onError(error: any) {
      qc.invalidateQueries({ queryKey: ["seller-products"] });
      toast.error(error.message);
    },
  });

  const rows: VariantRow[] = products.flatMap((pro) =>
    pro.variants.map((v) => {
      const lastCommission =
      Array.isArray(pro.commissionHistory) && pro.commissionHistory.length > 0
      ? pro.commissionHistory[pro.commissionHistory.length - 1]
      : null;


      return {
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
        commissionHistoryDate: lastCommission
          ? new Date(lastCommission.updatedAt).toLocaleDateString("en-IN")
          : "-",
        commissionHistoryAmount: lastCommission?.commission ?? 0,
        adminVisibility: pro.visibilityByAdmin,
        sellerVisibility: pro.visibilityBySeller,
        commissionHistory: pro.commissionHistory || [],
      };
    }),
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
        <Switch
          id="admin-product-visibility"
          checked={row.original.adminVisibility}
          onCheckedChange={(e) =>
            mutateVisibility({ proIds: [row.original.productId], isVisible: e })
          }
          disabled={status === "pending"}
        />
      ),
    },
    {
      accessorKey: "sellerVisibility",
      header: "Seller Visibility",
      cell: ({ row }) => (
        <Switch id="seller-product-visibility" checked={row.original.sellerVisibility} disabled />
      ),
    },
    { accessorKey: "productName", header: "Product Name" },
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
    {
      accessorKey: "originalPrice",
      header: "Price",
      cell: ({ row }) =>
        row.original.originalPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    {
      accessorKey: "discountPrice",
      header: "Discount Price",
      cell: ({ row }) =>
        row.original.discountPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    { accessorKey: "createdAt", header: "Created On" },
    { accessorKey: "commission", header: "Commission" },
    // {
    //   accessorKey: "commissionHistory",
    //   header: "Commission History",
    //   cell: ({ row }) => (
    //     <p>
    //       Previous Amount: {row.original.commissionHistoryAmount} | Updated At:{" "}
    //       {row.original.commissionHistoryDate}
    //     </p>
    //   ),
    // },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <Link to={`/product/${row.original.productId}`} target="_blank">
            <AiOutlineEye size={20} />
          </Link>
          <a href={`/product/${row.original.productId}`}>
            <AiOutlineEdit size={20} />
          </a>
          <UpdateCommissionDialog
            currentCommission={row.original.commission}
            productId={row.original.productId}
          />
          <DisplayCommission history={row.original.commissionHistory} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 w-full">
      <DataTable
        data={rows}
        columns={columns}
        docName="products"
        disabeAdminVisibilitySwitch={false}
        onVisibilityChange={(proIds: string[], isVisible: boolean) =>
          mutateVisibility({ isVisible, proIds })
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
