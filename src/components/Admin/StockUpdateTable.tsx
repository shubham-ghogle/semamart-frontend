import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import { Link } from "react-router";
import { BASE_URL } from "@/data";

type StockRow = {
  id: string;
  productId: string;
  date: string;
  customer: string;
  product: string;
  variantPrice: number;
  quantity: number;
  minOrderQty: number;
  size: string;
  colorOption?: string;
  status: string; // Out of Stock / Buffer Stock / In Stock
  thumbnail: string;
  businessName?: string;
  notified: string; // Yes / No
  viewOrder: (id: string) => void;
};

export default function StockUpdateTable() {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch("/api/v2/notifyRequest");
        if (!res.ok) throw new Error("Failed to fetch stock");

        const data = await res.json();
        if (data.success) setStockItems(data.data);
        else setError("Failed to load stock");
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  const rows: StockRow[] = stockItems.map((item) => {
    const minQty = parseInt(
      item.product_id?.minmaxrule
        ? JSON.parse(item.product_id.minmaxrule).minQty
        : "0",
      10
    );
    const availableStock = item.variant_id?.stock || 0;

    let status = "In Stock";
    if (availableStock === 0) {
      status = "Out of Stock";
    } else if (availableStock < minQty) {
      status = "Buffer Stock";
    }

    return {
      id: item._id,
      productId: item.product_id?._id || "",
      date: new Date(item.updatedAt).toLocaleDateString("en-IN"),
      thumbnail: BASE_URL + "images/" + (item.variant_id?.thumbnail || ""),
      colorOption: item.variant_id?.colorOption || "-",
      size: item.variant_id?.size || "-",
      customer: item.user_id?.instituteName || item.email || "-",
      product: item.product_id?.name || "-",
      businessName: item.shop_id?.businessName,
      variantPrice: item.variant_id?.discountPrice || 0,
      quantity: availableStock,
      minOrderQty: minQty,
      notified: item.notified ? "Yes" : "No",
      status: status,
      viewOrder: (id) => navigate(`/stock/${id}`),
    };
  });

  const columns: ColumnDef<StockRow>[] = [
    { accessorKey: "date", header: "Date" },
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
    { accessorKey: "customer", header: "Institute" },
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
    {
      accessorKey: "notified",
      header: "Notified",
      cell: ({ row }) => (
        <span
          className={
            row.original.notified === "Yes"
              ? "text-green-600 font-semibold"
              : "text-red-600 font-semibold"
          }
        >
          {row.original.notified}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let colorClass = "text-green-600 font-semibold"; // default: In Stock

        if (status === "Out of Stock") colorClass = "text-red-600 font-bold";
        else if (status === "Buffer Stock") colorClass = "text-yellow-600 font-semibold";

        return <span className={colorClass}>{status}</span>;
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Link to={`/product/${row.original.productId}`} target="_blank">
          <EyeIcon />
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
