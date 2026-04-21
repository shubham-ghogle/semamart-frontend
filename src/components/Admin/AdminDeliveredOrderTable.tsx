import { Order } from "@/Types/types";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { EyeIcon } from "lucide-react";
import { getVariantCommission, isBulkOrder } from "@/lib/utils";

type Row = {
  id: string;
  customer: string;
  businessName: string; // ✅ NEW
  productName: string;
  totalPrice: number;
  commission: number;
  qty: number;
  isBulkOrder: boolean;
  orderedOn: string;
  viewOrder: () => void;
};

export default function AdminDeliveredOrderTable({
  orders,
}: {
  orders: Order[];
}) {
  const navigate = useNavigate();

  const rows: Row[] = orders.map((el) => {
    let productName = "-";
    
    const pid =
      typeof el.variant === "object" ? (el.variant as any)?.productId : null;
    if (pid && typeof pid === "object") productName = pid.name ?? "-";
    const commission = getVariantCommission(el);

    return {
      id: el._id,
      customer:
        typeof el.user === "string" ? "-" : el.user?.instituteName ?? "-",

      businessName:
        typeof el.shop === "string" ? "-" : el.shop?.businessName ?? "-", // ✅ NEW

      productName,
      totalPrice: el.totalPrice ?? 0,
      commission: commission * (el.qty ?? 0),
      qty: el.qty ?? 0,
      isBulkOrder: isBulkOrder(el),
      orderedOn: el.createdAt
        ? new Date(el.createdAt).toLocaleDateString("en-IN")
        : "-",
      viewOrder: () => navigate(`/admin/orders/${el._id}`),
    };
  });

  const columns: ColumnDef<Row>[] = [
    /* ✅ SELECT COLUMN (same as AdminOrderTable) */
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

    { accessorKey: "orderedOn", header: "Date" },
    { accessorKey: "id", header: "Order ID" },
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <p className="w-32 truncate" title={row.original.productName}>
          {row.original.productName}
        </p>
      ),
    },
    { accessorKey: "customer", header: "Institute" },

    // ✅ NEW COLUMN
    {
      accessorKey: "businessName",
      header: "Seller",
    },
    {
      accessorKey: "isBulkOrder",
      header: "Type",
      cell: ({ row }) =>
        row.original.isBulkOrder ? (
          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
            Bulk Order
          </span>
        ) : (
          <span className="text-xs text-gray-500">Regular</span>
        ),
    },

    {
      accessorKey: "totalPrice",
      header: "Total Price",
      cell: ({ row }) =>
        row.original.totalPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      accessorKey: "commission",
      header: "Platform Fee",
      cell: ({ row }) => row.original.commission.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button variant="ghost" onClick={row.original.viewOrder}>
          <EyeIcon />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white shadow rounded">
      <DataTable
        data={rows}
        columns={columns}
        docName="admin-delivered-orders"
        searchColId="id"
        searchPlaceholder="Search by order id"
        enableCalender
        dateFieldId="orderedOn"
        /* ❌ no status filter */
      />
    </div>
  );
}
