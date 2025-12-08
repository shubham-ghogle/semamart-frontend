import { API_URL, BASE_URL } from "@/data";
import { Product } from "@/Types/types";
import { ColumnDef } from "@tanstack/react-table";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { DataTable } from "../ui/data-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ScreenOverlayLoaderUi } from "../UIComponents/LoaderUi";
import { Switch } from "../ui/switch";
import { useSellerStore } from "@/store/sellerStore";
import { FaRupeeSign } from "react-icons/fa";


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
};

type SellerProductTableProps = {
  products: Product[];
};

export default function SellerProductTable({
  products,
}: SellerProductTableProps) {
  const { seller } = useSellerStore((state) => state);

  const rows: VariantRow[] = products.flatMap((pro) =>
    pro.variants.map((v) => ({
      id: v._id,
      productName: pro.name,
      thumbnail: BASE_URL + "images/" + v.thumbnail,
      colorOption: v.colorOption || "-",
      size: v.size || "-",
      stock: v.stock,
      originalPrice: v.originalPrice,
      discountPrice: v.discountPrice ?? 0,
      createdAt: new Date(pro.createdAt).toLocaleDateString("en-IN"),
      productId: pro._id,
      commission: pro.commission || 0,
sellerVisibility: pro.visibilityBySeller !== false, // fallback: undefined => true
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
      accessorKey: "sellerVisibility",
      header: "ProductVisibility",
      cell: ({ row }) => (
        <section>
          <article>
            <Switch
              id="seller-prodcut-visibiity"
              checked={row.original.sellerVisibility}
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
      accessorKey: "productName",
      header: "Product Name",
      cell: ({ row }) => (
        <p className="w-32 text-ellipsis overflow-hidden">
          {row.original.productName}
        </p>
      ),
    },
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
        <div className="flex items-center gap-1">
         
          Commission <FaRupeeSign size={14} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
        
          {row.original.commission}  <FaRupeeSign size={14} />
        </div>
      ),
    },

        {
            id: "action",
            header: "Actions",
            cell: ({ row }) => (
              <div className="flex gap-4">
                {/* Edit button */}
                <Link to={`edit/${row.original.productId}`}>
                  <AiOutlineEdit size={20} className="text-blue-500" />
                </Link>

                {/* View/Preview button */}
                <Link to={`view/${row.original.productId}`}>
                  <AiOutlineEye size={20} className="text-gray-500" />
                </Link>
              </div>
            ),
          },

      ];

      const qc = useQueryClient();
      const { mutate: mutateVisibility, status } = useMutation({
        mutationFn: (data: { proIds: string[]; isVisible: boolean }) =>
          updateVisibility(data.proIds, data.isVisible),
        onSuccess: async () => {
          qc.invalidateQueries({
            queryKey: ["seller-products", seller?._id],
          });
        },
      onError(error: any) {
      const msg = error?.message || "Failed to update visibility";
      toast.error(msg);
      qc.invalidateQueries({ queryKey: ["seller-products", seller?._id] });
    },
  });

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        docName="products"
        disabeSellerVisibilitySwitch={false}
        onVisibilityChange={(proIds: string[], isVisible: boolean) =>
          mutateVisibility({ isVisible: isVisible, proIds: proIds })
        }
      />
      {status === "pending" && <ScreenOverlayLoaderUi />}
    </>
  );
}

async function updateVisibility(productIds: string[], isVisible: boolean) {
  const res = await fetch(API_URL + "product/seller-visibility", {
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
