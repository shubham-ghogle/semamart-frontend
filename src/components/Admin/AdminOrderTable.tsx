// src/components/Admin/AdminOrderTable.tsx
import { Order } from "@/Types/types";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { EyeIcon } from "lucide-react";
import { getVariantCommission, isBulkOrder } from "@/lib/utils";
import { getVisibleOrderRequest } from "@/lib/orderRequests";
import { getAdminDisplayOrderStatus } from "@/Screens/Admin/Admin.HooksAndUtils";

type Row = {
  id: string;
  status: string;
  customer: string;
  shop: string;
  totalPrice: number;
  commission: number;
  qty: number;  
  orderedOn: string;
  orderedAtTs: number;
  groupStyle: string;
  productName: string;
  sellerPayout: number;
  isBulkOrder: boolean;
  requestStatus: string;
  viewOrder: (orderId: string) => void;
};

type AdminOrderTableProps = {
  orders: Order[];
  docName?: string;
  searchPlaceholder?: string;
  enableStatusFilter?: boolean;
  emphasizeStatus?: boolean;
  statusResolver?: (order: Order) => string;
};

export default function AdminOrderTable({
  orders,
  docName = "orders",
  searchPlaceholder = "Search by order id",
  enableStatusFilter = true,
  emphasizeStatus = false,
  statusResolver,
}: AdminOrderTableProps) {
  const navigate = useNavigate();
  const GROUP_WINDOW_MS = 1 * 60 * 1000;

  const baseRows: Row[] = orders.map((el) => {
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
    const commission = getVariantCommission(el);
    

    const displayStatus = statusResolver
      ? statusResolver(el)
      : getAdminDisplayOrderStatus(el);

    const orderedAtTs = el.createdAt
      ? new Date(el.createdAt).getTime()
      : 0;

    return {
      id: el._id,
      status: displayStatus,
      requestStatus: getVisibleOrderRequest(el)?.status || "No Request",
      customer: typeof el.user === "string" ? "-" : (el.user?.instituteName ?? "-"),
      shop: typeof el.shop === "string" ? "-" : (el.shop?.businessName ?? "-"),
      productName,
      totalPrice: el.totalPrice ?? 0,
      sellerPayout: el.sellerPayout ?? 0,
      isBulkOrder: isBulkOrder(el),
      commission: commission * (el.qty ?? 0),
      qty: el.qty ?? 0,
      orderedOn: el.createdAt ? new Date(el.createdAt).toLocaleDateString("en-IN") : "-",
      orderedAtTs,
      groupStyle: "",
      viewOrder: (orderId: string) => {
        // navigate to a sensible path — adjust if your route differs
        navigate(`/admin/orders/${orderId}`);
      },
    };
  });

  const rows: Row[] = (() => {
    const groupStyles = [
      "border-l-4 border-l-sky-400 bg-sky-100",
      "border-l-4 border-l-emerald-400 bg-emerald-100",
      "border-l-4 border-l-amber-400 bg-amber-100",
      "border-l-4 border-l-rose-400 bg-rose-100",
      "border-l-4 border-l-violet-400 bg-violet-100",
    ];

    const byCustomerTimeAsc = [...baseRows].sort((a, b) => {
      if (a.customer !== b.customer) {
        return a.customer.localeCompare(b.customer);
      }
      return a.orderedAtTs - b.orderedAtTs;
    });

    let groupCounter = 0;
    let prevCustomer = "";
    let prevTs = -1;
    const groupMap = new Map<string, number>();

    for (const row of byCustomerTimeAsc) {
      const isNewGroup =
        row.customer !== prevCustomer ||
        prevTs < 0 ||
        Math.abs(row.orderedAtTs - prevTs) > GROUP_WINDOW_MS;

      if (isNewGroup) {
        groupCounter += 1;
      }

      groupMap.set(row.id, groupCounter);
      prevCustomer = row.customer;
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

  const statusColumn: ColumnDef<Row> = {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      let bgColor = "bg-gray-200 text-gray-800";
      if (status === "Verify Payment") bgColor = "bg-yellow-100 text-yellow-800";
      else if (status === "Pending") bgColor = "bg-blue-100 text-blue-800";
      else if (status === "Processing") bgColor = "bg-indigo-100 text-indigo-800";
      else if (status === "Shipped") bgColor = "bg-purple-100 text-purple-800";
      else if (status === "Delivered") bgColor = "bg-green-100 text-green-800";
      else if (status === "Cancelled") bgColor = "bg-red-100 text-red-800";
      else if (status === "Return") bgColor = "bg-orange-100 text-orange-800";

      return (
        <span
          className={`inline-flex rounded-full ${bgColor} ${
            emphasizeStatus ? "px-3 py-1.5 text-sm font-semibold shadow-sm" : "px-2 py-1 text-sm font-medium"
          }`}
        >
          {status}
        </span>
      );
    },
  };

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
    ...(emphasizeStatus ? [statusColumn] : []),
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
      accessorKey: "qty",
      header: "Quantity",
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
        (row.original.totalPrice ?? 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    {
      accessorKey: "commission",
      header: "Platform Fee",
      cell: ({ row }) =>
        (row.original.commission ?? 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },

    {
      accessorKey: "sellerPayout",
      header: "Seller Payout",
      cell: ({ row }) =>
        (row.original.sellerPayout ?? 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },

    {
      accessorKey: "requestStatus",
      header: "Request",
    },
    ...(!emphasizeStatus ? [statusColumn] : []),

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
        docName={docName}
        searchColId="id"
        searchPlaceholder={searchPlaceholder}
        enableCalender={true}
        dateFieldId="orderedOn"
        enableStatusFilter={enableStatusFilter}
        statusColumnId="status"
        statusOptions={[
          "All",
          "No Request",
          "Requested",
          "Sent To Seller",
          "Completed",
          "Admin Rejected",
          "Seller Rejected",
          "Verify Payment",
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
          "Return",
        ]}
      />
    </div>
  );
}
