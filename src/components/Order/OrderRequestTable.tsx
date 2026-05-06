import { Order } from "@/Types/types";
import { getVisibleOrderRequest } from "@/lib/orderRequests";
import { Button } from "../ui/button";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import { useNavigate } from "react-router";

type OrderRequestTableProps = {
  orders: Order[];
  basePath: string;
  customerLabel: string;
};

type RequestRow = {
  id: string;
  productName: string;
  customer: string;
  seller: string;
  requestType: string;
  requestStatus: string;
  orderedOn: string;
  view: () => void;
};

export default function OrderRequestTable({ orders, basePath, customerLabel }: OrderRequestTableProps) {
  const navigate = useNavigate();

  const rows: RequestRow[] = orders
    .map((order) => {
      const request = getVisibleOrderRequest(order);
      if (!request) return null;

      const productName =
        typeof order.variant !== "string" &&
        typeof order.variant.productId !== "string"
          ? order.variant.productId?.name || "-"
          : "-";

      return {
        id: order._id,
        productName,
        customer:
          typeof order.user !== "string"
            ? order.user?.instituteName || `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || "-"
            : "-",
        seller: typeof order.shop !== "string" ? order.shop?.businessName || "-" : "-",
        requestType: request.requestType,
        requestStatus: request.status,
        orderedOn: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "-",
        view: () => navigate(`${basePath}/${order._id}`),
      };
    })
    .filter(Boolean) as RequestRow[];

  const columns: ColumnDef<RequestRow>[] = [
    { accessorKey: "orderedOn", header: "Date" },
    { accessorKey: "id", header: "Order ID" },
    { accessorKey: "productName", header: "Product" },
    { accessorKey: "customer", header: customerLabel },
    { accessorKey: "seller", header: "Seller" },
    { accessorKey: "requestType", header: "Type" },
    { accessorKey: "requestStatus", header: "Status" },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={row.original.view}>
          <EyeIcon className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="rounded-sm bg-white p-4 shadow-sm">
      <DataTable
        data={rows}
        columns={columns}
        docName="order-requests"
        searchColId="id"
        searchPlaceholder="Search by order ID"
        enableCalender
        dateFieldId="orderedOn"
        enableStatusFilter
        statusColumnId="requestStatus"
        statusOptions={["All", "Requested", "Sent To Seller", "Completed", "Admin Rejected", "Seller Rejected"]}
      />
    </div>
  );
}
