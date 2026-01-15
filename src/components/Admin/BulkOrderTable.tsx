import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import { Link } from "react-router";

type BulkOrderRow = {
  id: string;
  productId: string;
  date: string;
  customer: string;
  product: string;
  variantPrice: number;
  quantity: number;
  status: string;
  viewOrder: (id: string) => void;
};

export default function BulkOrdersTable() {
  const [bulkOrders, setBulkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBulkOrders = async () => {
      try {
        const res = await fetch("/api/v2/bulkorder/get-bulk-order");
        if (!res.ok) throw new Error("Failed to fetch bulk orders");

        const data = await res.json();
        if (data.success) {
          setBulkOrders(data.bulkOrders);
        } else {
          setError("Failed to load bulk orders");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBulkOrders();
  }, []);

  // Show loading or error message if needed
  if (loading) return <p>Loading bulk orders...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  const rows: BulkOrderRow[] = bulkOrders.map((order) => ({
    id: order._id,
    productId: order.product_id._id,
    date: new Date(order.createdAt).toLocaleDateString("en-IN"),
    customer: order.user_id.instituteName || order.user_id.name,
    product: order.product_id.name,
    variantPrice: order.variant_id?.discountPrice || 0,
    quantity: order.quantity,
    status: order.status || "-",
    viewOrder: (id) => navigate(`/bulk-orders/${id}`),
  }));

  const columns: ColumnDef<BulkOrderRow>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "customer", header: "Institute" },
    { accessorKey: "product", header: "Product" },
    {
      accessorKey: "variantPrice",
      header: "Unit Price",
      cell: ({ row }) => `₹${row.original.variantPrice.toLocaleString("en-IN")}`,
    },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "status", header: "Status" },
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

  return (
    <DataTable
      data={rows}
      columns={columns}
      docName="bulk-orders"
      searchColId="product"
      searchPlaceholder="Search By Product Name"
      enableCalender={true}
      dateFieldId="date"
    />
  );
}
