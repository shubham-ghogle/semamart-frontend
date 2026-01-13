// src/components/Admin/AdminOrderTable.tsx
import { Order } from "@/Types/types";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { EyeIcon } from "lucide-react";

type Row = {
  id: string;
  status: string;
  customer: string;
  shop: string;
  totalPrice: number;
  orderedOn: string;
  productName: string;
  viewOrder: (orderId: string) => void;
};

type AdminOrderTableProps = {
  orders: Order[];
};

export default function AdminOrderTable({ orders }: AdminOrderTableProps) {
  const navigate = useNavigate();

  const rows: Row[] = orders.map((el) => {
    // Defensive extraction of product name — handle null, string, nested object
    let productName = "-";

    if (!el.variant) {
      productName = "-";
    } else if (typeof el.variant === "string") {
      productName = "-";
    } else {
      // el.variant is an object — check productId safely
      const pid = (el.variant as any).productId;
      if (!pid) {
        productName = "-";
      } else if (typeof pid === "string") {
        productName = "-";
      } else {
        // pid is object
        productName = pid?.name ?? "-";
      }
    }

    return {
      id: el._id,
      status: el.status === "Paid" ? "Verify Payment" : el.status || "-",
      customer: typeof el.user === "string" ? "-" : (el.user?.instituteName ?? "-"),
      shop: typeof el.shop === "string" ? "-" : (el.shop?.businessName ?? "-"),
      productName,
      totalPrice: el.totalPrice ?? 0,
      orderedOn: el.createdAt ? new Date(el.createdAt).toLocaleDateString("en-IN") : "-",
      viewOrder: (orderId: string) => {
        // navigate to a sensible path — adjust if your route differs
        navigate(`/admin/orders/${orderId}`);
      },
    };
  });

  const columns: ColumnDef<Row>[] = [
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
      cell: ({ row }) => (
        <p className="w-32 truncate" title={row.original.productName}>
          {row.original.productName}
        </p>
      ),
    },
    {
      accessorKey: "customer",
      header: "Institute",
    },
    {
      accessorKey: "shop",
      header: "Seller",
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
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button variant="ghost" onClick={() => row.original.viewOrder(row.original.id)}>
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
        docName="orders"
        searchColId="id"
        searchPlaceholder="Search by order id"
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
