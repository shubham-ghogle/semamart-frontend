import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import { Link } from "react-router";
import { BASE_URL } from "@/data";

type OutOfStockRow = {
  id: string; // variant ID
  productId: string; // product ID
  date: string;
  customer: string;
  product: string;
  variantPrice: number;
  quantity: number;
  size: string;
  colorOption?: string;
  // status: string;
  thumbnail: string;
  businessName?: string;
  viewOrder: (id: string) => void;
};

export default function OutOfStockTable() {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch("/api/v2/product/get-out-of-stock-products");
        if (!res.ok) throw new Error("Failed to fetch stock");

        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setStockItems(data.products);
        } else {
          setStockItems([]); // fallback
          setError("Failed to load stock");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  // Map stockItems to table rows safely
  const rows: OutOfStockRow[] = stockItems
    .flatMap((item) =>
      (item.variants || []).map((variant: any) => ({
        id: variant._id,
        productId: item._id,
        date: new Date(item.updatedAt).toLocaleDateString("en-IN"),
        thumbnail: BASE_URL + "images/" + (variant.thumbnail || ""),
        colorOption: variant.colorOption || "-",
        size: variant.size || "-",
        customer: item.user_id?.instituteName || item.email || "-",
        product: item.name || "-",
        businessName: item.shopId?.businessName || "-",
        variantPrice: variant.discountPrice || 0,
        quantity: variant.stock || 0,
        // status: variant.stock === 0 ? "Out of Stock" : "In Stock",
        viewOrder: (id: string) => navigate(`/stock/${id}`),
      }))
    )
    .filter((row) => row.quantity === 0); // Only show Out of Stock

  const columns: ColumnDef<OutOfStockRow>[] = [
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
    { accessorKey: "product", header: "Product" },
    { accessorKey: "businessName", header: "Seller" },
    { accessorKey: "colorOption", header: "Color" },
    { accessorKey: "size", header: "Size" },
    {
      accessorKey: "variantPrice",
      header: "Unit Price",
      cell: ({ row }) =>
        `₹${row.original.variantPrice.toLocaleString("en-IN")}`,
    },
    // { accessorKey: "quantity", header: "Stock" },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }) =>
    //     row.original.status === "Out of Stock" ? (
    //       <span className="text-red-600 font-bold">{row.original.status}</span>
    //     ) : (
    //       <span>{row.original.status}</span>
    //     ),
    // },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Link
            to={`/product/${row.original.productId}`}
            target="_blank"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          >
            <EyeIcon className="w-4 h-4 text-gray-600" />
          </Link>
      ),
    },
  ];

  if (loading) return <div className="p-4">Loading stock...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <DataTable
      data={rows}
      columns={columns}
      docName="stock-table"
      searchColId="product"
      searchPlaceholder="Search By Product Name"
      enableCalender={true}
      dateFieldId="date"
    />
  );
}
