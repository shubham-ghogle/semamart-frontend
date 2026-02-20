
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL, BASE_URL } from "@/data";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { AiOutlineEye } from "react-icons/ai";
import { ScreenOverlayLoaderUi } from "@/components/UIComponents/LoaderUi";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import UpdateCommissionDialog from "../UpdateCommissionDialog";
import { Link } from "react-router-dom";

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
  commission: number;
  sellerVisibility: boolean;
  adminVisibility: boolean;
  commissionHistoryDate: string;
  commissionHistoryAmount: number;
  seller: string;
  avgRating: number;
};

export default function AdminProduct() {
  const qc = useQueryClient();

  // Fetch admin products (server returns { products: [...] } as in your controller)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch(API_URL + "product/admin-all-products", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const body = await res.json();
      return body.products || [];
    },
  });

  // Mutation: Admin Visibility
  const { mutate: mutateAdminVisibility, status: adminMutStatus } = useMutation({
    mutationFn: async (payload: { productIds: string[]; isVisible: boolean }) => {
      // server expects { productIds, isVisible }
      const res = await fetch(API_URL + "product/admin-visibility", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: payload.productIds,
          isVisible: payload.isVisible,
        }),
      });

      if (!res.ok) {
        // try to extract message from body
        let errMsg = "Failed to update admin visibility";
        try {
          const b = await res.json();
          if (b && b.message) errMsg = b.message;
        } catch {}
        throw new Error(errMsg);
      }

      return res.json().catch(() => ({ success: true }));
    },
    onSuccess: () => {
      toast.success("Admin visibility updated");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error updating admin visibility");
    },
  });

  // flatten to rows
  const rows: VariantRow[] = (data || []).flatMap((pro: any) =>
    (pro.variants || []).map((v: any) => ({
      id: v._id,
      productName: pro.name || "-",
      thumbnail: BASE_URL + "images/" + (v?.thumbnail || ""),
      colorOption: v?.colorOption || "-",
      size: v?.size || "-",
      stock: v?.stock ?? 0,
      originalPrice: v?.originalPrice ?? 0,
      discountPrice: v?.discountPrice ?? 0,
      createdAt: pro?.createdAt ? new Date(pro.createdAt).toLocaleDateString("en-IN") : "-",
      productId: pro._id,
      commission: pro?.commission ?? 0,
      seller: pro?.shopId?.businessName ?? "-",
      sellerVisibility: typeof pro.visibilityBySeller === "boolean" ? pro.visibilityBySeller : true,
      adminVisibility: typeof pro.visibilityByAdmin === "boolean" ? pro.visibilityByAdmin : false,
      avgRating: pro.avgRating ?? "-",
    }))
  );

  const columns: ColumnDef<VariantRow>[] = [
   
    {
      id: "adminVisibility",
      header: "Admin",
      cell: ({ row }) => (
        <Switch
          checked={row.original.adminVisibility}
          disabled={adminMutStatus === "pending"}
          onCheckedChange={(e) => {
            // call mutation with productIds (server expects productIds)
            mutateAdminVisibility({ productIds: [row.original.productId], isVisible: e });
          }}
        />
      ),
    },
    {
      id: "sellerVisibility",
      header: "Seller",
      cell: ({ row }) => <Switch disabled checked={row.original.sellerVisibility} />,
    },
    { accessorKey: "createdAt", header: "Created On" },
    {
      accessorKey: "thumbnail",
      header: "Image",
      cell: ({ row }) => (
        <img src={row.original.thumbnail} alt="thumb" className="w-12 h-12 object-cover rounded" />
      ),
    },
    { accessorKey: "seller", header: "Seller" },
    {
      accessorKey: "productName",
      header: "Product Name",
      cell: ({ row }) => <p className="w-32 overflow-hidden text-ellipsis">{row.original.productName}</p>,
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
      header: "% Price",
      cell: ({ row }) =>
        row.original.discountPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    
    {
      accessorKey: "commission",
      header: "Platform Fee",
      cell: ({ row }) => row.original.commission.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    { accessorKey: "avgRating", header: "Rating" },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
      <Link to={`/product/${row.original.productId}`} target="_blank">
        <AiOutlineEye size={20} />
      </Link>
      <UpdateCommissionDialog
        currentCommission={row.original.commission}
        productId={row.original.productId}
      />
    </div>
      ),
    },
  ];

  if (isLoading) return <ScreenOverlayLoaderUi />;
  if (isError) return <p className="p-4">Unable to load products</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">All Products</h1>

      <DataTable
        data={rows}
        columns={columns}
        docName="admin-products"
        // keep seller switch disabled in DataTable (your DataTable prop is `disabeSellerVisibilitySwitch` in earlier code)
        disabeSellerVisibilitySwitch
        onVisibilityChange={(ids: string[], visible: boolean) =>
          // if DataTable triggers multi-change, we forward to admin mutate
          mutateAdminVisibility({ productIds: ids, isVisible: visible })
        }
        enableCalender={true}
        dateFieldId="createdAt"
      />

      {adminMutStatus === "pending" && <ScreenOverlayLoaderUi />}
    </div>
  );
}
