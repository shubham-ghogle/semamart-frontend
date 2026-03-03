import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import { Link } from "react-router";
import { BASE_URL } from "@/data";

type BufferStockRow = {
  id: string;
  productId: string;
  product: string;
  variantPrice: number;
  quantity: number;
  minOrderQty: number;
  size: string;
  colorOption?: string;
  status: string; // only "Out of Stock" or ""
  thumbnail: string;
  businessName?: string;
  viewOrder: (id: string) => void;
};

export default function BufferStockTable() {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStock = async () => {
      try {
       const res = await fetch("/api/v2/product/get-low-stock-products", { 
        credentials: "include" 
      });
        
        if (!res.ok) throw new Error("Failed to fetch stock");

        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setStockItems(data.products); // <- correct property from API
        } else {
          setStockItems([]);
          setError("No products found");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  // Map API response to table rows safely
  const rows: BufferStockRow[] = (stockItems || []).map((item) => {
    // Parse min order qty from minmaxrule
    let minQty = 0;
    try {
      minQty = item.minmaxrule ? parseInt(JSON.parse(item.minmaxrule).minQty || "0", 10) : 0;
    } catch {
      minQty = 0;
    }

    // Get first variant if exists
    const variant = Array.isArray(item.variants) && item.variants.length > 0 ? item.variants[0] : {};

    return {
      id: item._id || "",
      productId: item._id || "",
      // date: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("en-IN") : "-",
      thumbnail: BASE_URL + "images/" + (variant.thumbnail || ""),
      colorOption: variant.colorOption || "-",
      size: variant.size || "-",
      product: item.name || "-",
      businessName: item.shopId?.businessName || "-",
      variantPrice: variant.discountPrice || 0,
      quantity: variant.stock || 0,
      minOrderQty: minQty,
      status: (variant.stock || 0) < minQty ? "Out of Stock" : "",
      viewOrder: (id: string) => navigate(`/stock/${id}`),
    };
  });

  // Table columns
  const columns: ColumnDef<BufferStockRow>[] = [
    // { accessorKey: "date", header: "Date" },
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
    // { accessorKey: "customer", header: "Institute" },
    { accessorKey: "product", header: "Product" },
    { accessorKey: "businessName", header: "Business" },
    { accessorKey: "colorOption", header: "Color" },
    { accessorKey: "size", header: "Size" },
    { accessorKey: "minOrderQty", header: "Min Order Qty" },
    {
      accessorKey: "variantPrice",
      header: "Unit Price",
      cell: ({ row }) => `₹${row.original.variantPrice.toLocaleString("en-IN")}`,
    },
    { accessorKey: "quantity", header: "Stock" },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }) =>
    //     row.original.status ? (
    //       <span className="text-red-600 font-bold">{row.original.status}</span>
    //     ) : null,
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
