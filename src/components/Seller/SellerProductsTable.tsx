import { BASE_URL } from "@/data"
import { Product } from "@/Types/types"
import { ColumnDef } from "@tanstack/react-table"
import { AiOutlineEye } from "react-icons/ai"
import { Link } from "react-router-dom"
import { DataTable } from "../ui/data-table"

type VariantRow = {
  id: string
  productName: string
  thumbnail: string
  colorOption?: string
  size?: string
  stock: number
  originalPrice: number
  discountPrice: number
  createdAt: string
  productId: string
}

type SellerProductTableProps = {
  products: Product[]
}

export default function SellerProductTable({ products }: SellerProductTableProps) {

  const rows: VariantRow[] = products.flatMap(pro =>
    pro.variants.map(v => ({
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
    }))
  )

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
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <Link to={`view/${row.original.productId}`}>
          <AiOutlineEye size={20} />
        </Link>
      ),
    },
  ]

  return <DataTable data={rows} columns={columns} docName="products" />
}
