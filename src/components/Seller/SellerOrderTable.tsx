import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { EyeIcon } from "lucide-react";

import { Order } from "../../Types/types";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { getVariantCommission } from "@/lib/utils";

/* ================= TYPES ================= */

type Row = {
  id: string;
  status: string;
  productName: string;
  customerName: string;
  totalPrice: number;
  commission: number;
  qty: number;
  orderedOn: string;
  orderedAtTs: number;
  groupStyle: string;
  viewOrder: () => void;
};

type SellerOrderTableProps = {
  orders: Order[];
};

/* ================= COMPONENT ================= */

export default function SellerOrderTable({ orders }: SellerOrderTableProps) {
  const navigate = useNavigate();
  const GROUP_WINDOW_MS = 1 * 60 * 1000;

const truncate = (text: string, max = 35) =>
  text.length > max ? text.slice(0, max) + "..." : text;

  const baseRows = orders.map((order) => {
    const productName =
      typeof order.variant !== "string" &&
      order.variant?.productId &&
      typeof order.variant.productId !== "string"
        ? truncate(order.variant.productId.name, 35)
        : "-";
      
    const customerName =
      typeof order.user !== "string"
        ? order.user.instituteName
        : "-";
    const commission = getVariantCommission(order);

    const orderedAtTs = order.createdAt
      ? new Date(order.createdAt).getTime()
      : 0;

    return {
      id: order._id,
      status: order.status === "Paid" ? "Processing" : (order.status ?? "-"),
      productName,
      customerName,
      totalPrice: order.totalPrice,
      commission: commission * (order.qty ?? 0),
      qty: order.qty ?? 0,
      orderedOn: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN")
      : "-",
      orderedAtTs,
      groupStyle: "",
      viewOrder: () => navigate(`/seller/orders/${order._id}`),
    };
  });

  // Group rows by same customer + near order time (1 min window), then keep each group contiguous.
  const rows: Row[] = (() => {
    const groupStyles = [
      "border-l-4 border-l-sky-400 bg-sky-100",
      "border-l-4 border-l-emerald-400 bg-emerald-100",
      "border-l-4 border-l-amber-400 bg-amber-100",
      "border-l-4 border-l-rose-400 bg-rose-100",
      "border-l-4 border-l-violet-400 bg-violet-100",
    ];

    const byCustomerTimeAsc = [...baseRows].sort((a, b) => {
      if (a.customerName !== b.customerName) {
        return a.customerName.localeCompare(b.customerName);
      }
      return a.orderedAtTs - b.orderedAtTs;
    });

    let groupCounter = 0;
    let prevCustomer = "";
    let prevTs = -1;
    const groupMap = new Map<string, number>();

    for (const row of byCustomerTimeAsc) {
      const isNewGroup =
        row.customerName !== prevCustomer ||
        prevTs < 0 ||
        Math.abs(row.orderedAtTs - prevTs) > GROUP_WINDOW_MS;

      if (isNewGroup) {
        groupCounter += 1;
      }

      groupMap.set(row.id, groupCounter);
      prevCustomer = row.customerName;
      prevTs = row.orderedAtTs;
    }

    return [...baseRows]
      .map((row) => ({
        ...row,
        groupStyle:
          groupStyles[((groupMap.get(row.id) || 1) - 1) % groupStyles.length],
      }))
      .sort((a, b) => {
        const groupA = groupMap.get(a.id) || 0;
        const groupB = groupMap.get(b.id) || 0;
        if (groupA !== groupB) return groupB - groupA;
        return b.orderedAtTs - a.orderedAtTs;
      });
  })();

  /* ================= COLUMNS ================= */

  const columns: ColumnDef<Row>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) =>
            table.toggleAllPageRowsSelected(e.target.checked)
          }
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
      cell: ({ row }) => (
        <div className={`pl-2 pr-2 py-1 rounded-sm ${row.original.groupStyle}`}>
          {row.original.orderedOn}
        </div>
      ),
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
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    const status = row.original.status;

    // Eye-catching colors for each status
    const statusColors: Record<string, string> = {
      Created: "bg-indigo-100 text-indigo-800",
      Processing: "bg-yellow-100 text-yellow-800",
      Packed: "bg-orange-100 text-orange-900",
      Shipped: "bg-purple-100 text-purple-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };

    const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}
      >
        {status}
      </span>
    );
  },
}
,

    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={row.original.viewOrder}
        >
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
        docName="orders"
        searchColId="id"
        searchPlaceholder="Search by order ID"
        enableCalender={true}
        dateFieldId="orderedOn"
        enableStatusFilter={true}       
        statusColumnId="status"         
        statusOptions={[
            "All",
            "Verify Payment",
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
        ]}
      />
    </div>
  );
}
