import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { EyeIcon } from "lucide-react";

import { Order } from "../../Types/types";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";

/* ================= TYPES ================= */

type Row = {
  id: string;
  productName: string;
  customerName: string;
  totalPrice: number;
  commission: number;
  qty: number;
  orderedOn: string;
  viewOrder: () => void;
};

type SellerDeliveredOrderTableProps = {
  orders: Order[];
};

/* ================= COMPONENT ================= */

export default function SellerDeliveredOrderTable({
  orders,
}: SellerDeliveredOrderTableProps) {
  const navigate = useNavigate();

  const truncate = (text: string, max = 35) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  const rows: Row[] = orders.map((order) => {
    const productName =
      typeof order.variant !== "string" &&
      order.variant?.productId &&
      typeof order.variant.productId !== "string"
        ? truncate(order.variant.productId.name, 35)
        : "-";
    let commission = 0;

    const customerName =
      typeof order.user !== "string" ? order.user.instituteName : "-";
    const pid =
      typeof order.variant === "object"
        ? (order.variant as any)?.productId
        : null;
    if (pid && typeof pid === "object") commission = pid.commission ?? 0;

    return {
      id: order._id,
      productName,
      customerName,
      totalPrice: order.totalPrice,
      commission: commission * (order.qty ?? 0),
      qty: order.qty ?? 0,
      orderedOn: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-IN")
        : "-",
      viewOrder: () => navigate(`/seller/orders/${order._id}`),
    };
  });

  /* ================= COLUMNS ================= */

  const columns: ColumnDef<Row>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "orderedOn",
      header: "Date",
    },
    {
      accessorKey: "id",
      header: "Order ID",
    },
    {
      accessorKey: "productName",
      header: "Product",
    },
    {
      accessorKey: "customerName",
      header: "Institute",
    },
    {
      accessorKey: "totalPrice",
      header: "Total Price",
      cell: ({ row }) =>
        (row.original.totalPrice ?? 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
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
      header: "Action",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={row.original.viewOrder}>
          <EyeIcon className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="p-4 bg-white shadow rounded">
      <DataTable
        data={rows}
        columns={columns}
        docName="delivered-orders"
        searchColId="id"
        searchPlaceholder="Search by order ID"
        enableCalender={true}
        dateFieldId="orderedOn"
        /* ❌ no status filter */
      />
    </div>
  );
}
