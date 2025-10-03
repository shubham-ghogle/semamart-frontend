import { Product } from "@/Types/types";
import { DataTable } from "../ui/data-table";
import { Link } from "react-router";
import { AiOutlineEye } from "react-icons/ai";
import { ColumnDef } from "@tanstack/react-table";
import { BASE_URL } from "@/data";
import UpdateCommissionDialog from "./UpdateCommissionDialog";

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
    }))
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
    { accessorKey: "originalPrice", header: "Price" },
    { accessorKey: "discountPrice", header: "Discount Price" },
    {
      accessorKey: "createdAt",
      header: "Created On",
    },
    { accessorKey: "commission", header: "Commission (%)" },
    { accessorKey: "earning", header: "SEMA Earning",cell:({row})=>(
      <span>{row.original.originalPrice * row.original.commission / 100}</span>
    ) },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <article className="flex items-center gap-4">
          {/* <Link to={`/admin/products/view/${row.original.productId}`}> */}
          <Link to={row.original.productId}>
            <AiOutlineEye size={20} />
          </Link>
          <UpdateCommissionDialog
            currentCommission={row.original.commission}
            productId={row.original.productId}
          />
        </article>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white shadow rounded">
      <DataTable data={rows} columns={columns} docName="products" />
    </div>
  );
}
