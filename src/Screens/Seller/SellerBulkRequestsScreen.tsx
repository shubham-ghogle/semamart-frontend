import SellerMainWrapper from "@/components/Seller/SellerMainWrapper";
import { DataTable } from "@/components/ui/data-table";
import { API_URL, BASE_URL } from "@/data";
import { useSellerSession } from "./sellerSession";
import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

type BulkOrderStatus = "NEW" | "CONTACTED" | "APPROVED" | "REJECTED" | "CLOSED";

type BulkRow = {
  id: string;
  date: string;
  institute: string;
  product: string;
  quantity: number;
  unitPrice: number;
  status: BulkOrderStatus;
  comment: string;
  thumbnail: string;
};

export default function SellerBulkRequestsScreen() {
  const { canAccess } = useSellerSession();
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchBulkOrders = async () => {
    try {
      setStatus("pending");
      const res = await fetch(`${API_URL}bulkorder/seller-bulk-orders`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch bulk requests");
      }

      const mapped = (data.bulkOrders || []).map((order: any) => ({
        id: order._id,
        date: new Date(order.createdAt).toLocaleDateString("en-IN"),
        institute: order.user_id?.instituteName || "-",
        product: order.product_id?.name || "-",
        quantity: Number(order.quantity || 0),
        unitPrice: Number(order.unitPrice || 0),
        status: order.status as BulkOrderStatus,
        comment: order.comment || "",
        thumbnail: order.variant_id?.thumbnail
          ? `${BASE_URL}images/${order.variant_id.thumbnail}`
          : "/placeholder.png",
      }));

      setRows(mapped);
      setStatus("success");
      setErrorMessage("");
    } catch (error: any) {
      setRows([]);
      setStatus("error");
      setErrorMessage(error.message || "Failed to fetch bulk requests");
    }
  };

  useEffect(() => {
    if (!canAccess("Requests")) return;
    fetchBulkOrders();
  }, [canAccess]);

  const updateStatus = async (id: string, nextStatus: "APPROVED" | "REJECTED") => {
    const note = window.prompt(
      nextStatus === "APPROVED"
        ? "Optional note for admin"
        : "Reason for rejection",
      "",
    );

    try {
      const res = await fetch(`${API_URL}bulkorder/seller-update-status/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, note }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to update bulk request");
      }
      toast.success(data.message || "Bulk request updated");
      fetchBulkOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to update bulk request");
    }
  };

  const columns = useMemo<ColumnDef<BulkRow>[]>(
    () => [
      { accessorKey: "date", header: "Date" },
      {
        accessorKey: "thumbnail",
        header: "Image",
        cell: ({ row }) => (
          <img
            src={row.original.thumbnail}
            alt={row.original.product}
            className="h-12 w-12 rounded object-cover"
          />
        ),
      },
      { accessorKey: "institute", header: "Institute" },
      { accessorKey: "product", header: "Product" },
      { accessorKey: "quantity", header: "Qty" },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => `₹${row.original.unitPrice.toLocaleString("en-IN")}`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <span className="font-medium">{row.original.status}</span>,
      },
      {
        accessorKey: "comment",
        header: "Comment",
        cell: ({ row }) => (
          <p className="max-w-48 truncate" title={row.original.comment}>
            {row.original.comment || "-"}
          </p>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) =>
          row.original.status === "CONTACTED" ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateStatus(row.original.id, "APPROVED")}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(row.original.id, "REJECTED")}>
                Reject
              </Button>
            </div>
          ) : (
            <span className="text-xs text-slate-500">Waiting for next step</span>
          ),
      },
    ],
    [],
  );

  return (
    <SellerMainWrapper
      heading="Bulk Requests"
      status={canAccess("Requests") ? status : "success"}
      errorMessage={errorMessage}
    >
      {!canAccess("Requests") ? (
        <div className="rounded-xl border bg-white p-4 text-gray-600">
          You do not have access to bulk requests.
        </div>
      ) : (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <DataTable
            data={rows}
            columns={columns}
            docName="seller-bulk-requests"
            searchColId="product"
            searchPlaceholder="Search by product"
            enableCalender
            dateFieldId="date"
          />
        </div>
      )}
    </SellerMainWrapper>
  );
}
