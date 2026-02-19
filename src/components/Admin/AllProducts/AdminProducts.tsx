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
  seller: string;
  badge: boolean; // ✅ NEW
};

export default function AdminProduct() {
  const qc = useQueryClient();

  // Fetch products
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

  // -------------------- ADMIN VISIBILITY --------------------
  const { mutate: mutateAdminVisibility, status: adminMutStatus } =
    useMutation({
      mutationFn: async (payload: {
        productIds: string[];
        isVisible: boolean;
      }) => {
        const res = await fetch(API_URL + "product/admin-visibility", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          throw new Error(b?.message || "Failed to update admin visibility");
        }

        return res.json();
      },
      onSuccess: () => {
        toast.success("Admin visibility updated");
        qc.invalidateQueries({ queryKey: ["admin-products"] });
      },
      onError: (err: any) => {
        toast.error(err?.message || "Error updating admin visibility");
      },
    });

  // -------------------- BADGE TOGGLE --------------------
  const { mutate: mutateBadge, status: badgeMutStatus } = useMutation({
  mutationFn: async (productId: string) => {
    const res = await fetch(
      API_URL + `product/update-badge/${productId}`,
      {
        method: "PUT",
        credentials: "include",
      }
    );

    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      throw new Error(b?.message || "Failed to update badge");
    }

    return res.json();
  },

  onSuccess: (data) => {
    const { productId, badge } = data;

    // ✅ HARD update cache properly
    qc.setQueryData(["admin-products"], (old: any[] | undefined) => {
      if (!old) return old;

      return old.map((product) =>
        product._id === productId
          ? { ...product, badge } // use backend returned value
          : product
      );
    });

    toast.success(data?.message || "Badge updated");
  },

  onError: (err: any) => {
    toast.error(err?.message || "Error updating badge");
  },
});

  // -------------------- FLATTEN DATA --------------------
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
      createdAt: pro?.createdAt
        ? new Date(pro.createdAt).toLocaleDateString("en-IN")
        : "-",
      productId: pro._id,
      commission: pro?.commission ?? 0,
      seller: pro?.shopId?.businessName ?? "-",
      sellerVisibility:
        typeof pro.visibilityBySeller === "boolean"
          ? pro.visibilityBySeller
          : true,
      adminVisibility:
        typeof pro.visibilityByAdmin === "boolean"
          ? pro.visibilityByAdmin
          : false,
      badge: typeof pro.badge === "boolean" ? pro.badge : false, // ✅ NEW
    }))
  );

  // -------------------- COLUMNS --------------------
  const columns: ColumnDef<VariantRow>[] = [
    // ✅ BADGE COLUMN
    {
      id: "badge",
      header: "Badge",
      cell: ({ row }) => (
        <Switch
          checked={row.original.badge}
          disabled={badgeMutStatus === "pending"}
          onCheckedChange={() =>
            mutateBadge(row.original.productId)
          }
        />
      ),
    },

    {
      id: "adminVisibility",
      header: "Admin",
      cell: ({ row }) => (
        <Switch
          checked={row.original.adminVisibility}
          disabled={adminMutStatus === "pending"}
          onCheckedChange={(e) =>
            mutateAdminVisibility({
              productIds: [row.original.productId],
              isVisible: e,
            })
          }
        />
      ),
    },

    {
      id: "sellerVisibility",
      header: "Seller",
      cell: ({ row }) => (
        <Switch disabled checked={row.original.sellerVisibility} />
      ),
    },

    { accessorKey: "createdAt", header: "Created On" },

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

    { accessorKey: "seller", header: "Seller" },

    {
      accessorKey: "productName",
      header: "Product Name",
      cell: ({ row }) => (
        <p className="w-32 overflow-hidden text-ellipsis">
          {row.original.productName}
        </p>
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
      header: "% Price",
      cell: ({ row }) =>
        row.original.discountPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },

    {
      accessorKey: "commission",
      header: "Platform Fee",
      cell: ({ row }) =>
        row.original.commission.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },

    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/product/${row.original.productId}`}
            target="_blank"
          >
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
        disabeSellerVisibilitySwitch
        onVisibilityChange={(ids: string[], visible: boolean) =>
          mutateAdminVisibility({ productIds: ids, isVisible: visible })
        }
        enableCalender={true}
        dateFieldId="createdAt"
      />

      {(adminMutStatus === "pending" ||
        badgeMutStatus === "pending") && (
        <ScreenOverlayLoaderUi />
      )}
    </div>
  );
}
