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

  const rows: Row[] = orders.map((el) => ({
    id: el._id,
    status: el.status === "Paid" ? "Verify Payment" : el.status || "-",
    customer: typeof el.user === "string" ? "-" : el.user.instituteName,
    shop: typeof el.shop === "string" ? "-" : el.shop?.businessName || "-",
    productName:
    typeof el.variant === "string"
      ? "-" // variant is a string, fallback
      : typeof el.variant.productId === "string"
      ? "-" // productId is a string, fallback
      : el.variant.productId?.name || "-",
    totalPrice: el.totalPrice,
    orderedOn: new Date(el.createdAt || "").toLocaleDateString("en-IN"),
    viewOrder: (orderId: string) => {
      navigate(orderId);
    },
  }));

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
      cell: ({ row }) => <p className="w-32 overflow-hidden text-ellipsis">{row.original.productName}</p>,
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
        <Button
          variant="ghost"
          onClick={() => row.original.viewOrder(row.original.id)}
        >
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
      />
    </div>
  );
}
