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
  totalPrice: string;
  orderedOn: string;
  viewOrder: (orderId: string) => void;
};

type AdminOrderTableProps = {
  orders: Order[];
};

export default function AdminOrderTable({orders}:AdminOrderTableProps){

  const navigate = useNavigate()

  const rows: Row[] = orders.map((el) => ({
    id: el._id,
    status: el.status || "-",
    customer: typeof el.user ==="string"?"-": el.user.firstName,
    shop:typeof el.shop==="string"?"-":el.shop?.businessName||"-",
    totalPrice: el.totalPrice.toString(),
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
      accessorKey: "id",
      header: "Order ID",
    },
    {
      accessorKey: "customer",
      header: "Customer Name",
    },
    {
      accessorKey: "shop",
      header: "Shop Name",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "totalPrice",
      header: "Total Price",
    },
    {
      accessorKey: "orderedOn",
      header: "Ordered On",
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
      />
    </div>
  );
}