import  { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AdminMainWrapper from "./AdminMainWrapper";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { EyeIcon } from "lucide-react";
import { Link } from "react-router";

type BulkOrderRow = {
  id: string;
  productId: string;
  customer: string;
  product: string;
  variantPrice: number;
  quantity: number;
  status: string;
};

export default function BulkOrderTable() {
  const [bulkOrders, setBulkOrders] = useState<any[] | null>(null);
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
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBulkOrders();
  }, []);


  const rows: BulkOrderRow[] = (bulkOrders ?? []).map((order) => ({
    id: order._id,
    productId: order.product_id._id,
    date: new Date(order.createdAt).toLocaleDateString("en-IN"),
    customer: `${order.user_id.firstName} ${order.user_id.lastName}`,
    product: order.product_id.name,
    variantPrice: order.variant_id.discountPrice,
    quantity: order.quantity,
    status: order.status || "-",
    viewOrder: (orderId: string) => navigate(`/bulk-orders/${orderId}`),
  }));


  const columns: ColumnDef<BulkOrderRow>[] = [
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
    { accessorKey: "date", header: "Request Date" },
    { accessorKey: "customer", header: "Institute Name" },
    { accessorKey: "product", header: "Product Name" },
    {
      accessorKey: "variantPrice",
      header: "Price",
      cell: ({ row }) =>
        `₹${row.original.variantPrice.toLocaleString("en-IN")}`,
    },
    { accessorKey: "quantity", header: "Quantity Request" },
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Link
         to={`/product/${row.original.productId}`}
          target="_blank"
          className="text-muted-foreground hover:text-primary"

        >
          <EyeIcon />
        </Link>
      ),
    },
  ];


  let status: "pending" | "success" | "error" = "pending";
  if (loading) status = "pending";
  else if (error) status = "error";
  else status = "success";

  return (
    <AdminMainWrapper
      status={status}
      errorMeassage={error || undefined}
      heading="Bulk Orders Request"
    >
      <div className="p-4 bg-white shadow rounded">
        <DataTable
          data={rows}
          columns={columns}
          docName="bulk-orders"
          searchColId="product"
          searchPlaceholder="Search By Product Name"
          enableCalender={true}
          dateFieldId="date"
        />
      </div>
    </AdminMainWrapper>
  );
}
