import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, ClockIcon,  MessageSquare } from "lucide-react";

import { DataTable } from "../ui/data-table";
import { BASE_URL } from "@/data";

/* -------------------- STATUS TYPES -------------------- */
const BULK_ORDER_STATUSES = [
  "NEW",
  "CONTACTED",
  "APPROVED",
  "REJECTED",
  "CLOSED",
] as const;

type BulkOrderStatus = (typeof BULK_ORDER_STATUSES)[number];

const STATUS_TEXT_COLOR: Record<BulkOrderStatus, string> = {
  NEW: "text-blue-600",
  CONTACTED: "text-yellow-600",
  APPROVED: "text-green-600",
  REJECTED: "text-red-600",
  CLOSED: "text-gray-600",
};


/* -------------------- TYPES -------------------- */
type AdminNote = {
  note: string;
  createdAt: string;
  status: BulkOrderStatus;
};

type BulkOrderRow = {
  id: string;
  productId: string;
  date: string;
  customer: string;
  product: string;
  variantPrice: number;
  quantity: number;
  status: BulkOrderStatus;
  customerPrice: number;
  thumbnail: string;
  adminNotes: AdminNote[];
  comment?: string;
};

/* -------------------- HELPER -------------------- */
const getAllowedStatuses = (
  currentStatus: BulkOrderStatus
): readonly BulkOrderStatus[] => {
  if (currentStatus === "APPROVED") {
    return BULK_ORDER_STATUSES.filter((s) => s !== "REJECTED");
  }

  if (currentStatus === "REJECTED") {
    return BULK_ORDER_STATUSES.filter((s) => s !== "APPROVED");
  }

  return BULK_ORDER_STATUSES;
};


/* -------------------- COMPONENT -------------------- */
export default function BulkOrdersTable() {
  const [bulkOrders, setBulkOrders] = useState<BulkOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] =
  useState<BulkOrderStatus>("NEW");
  const [note, setNote] = useState("");

  const [historyOrder, setHistoryOrder] =
    useState<BulkOrderRow | null>(null);
  
  const [commentOrder, setCommentOrder] = useState<BulkOrderRow | null>(null);
  

  /* -------------------- FETCH -------------------- */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/v2/bulkorder/get-bulk-order");
        const data = await res.json();

        if (data.success) {
          const mapped: BulkOrderRow[] = data.bulkOrders.map((order: any) => ({
            id: order._id,
            productId: order.product_id._id,
            date: new Date(order.createdAt).toISOString().split("T")[0],
            customer: order.user_id.instituteName || order.user_id.name,
            product: order.product_id.name,
            variantPrice: Number(order.variant_id?.discountPrice) || 0,
            quantity: order.quantity,
            status: order.status as BulkOrderStatus,
            customerPrice: Number(order.customerPrice) || 0,
            thumbnail: `${BASE_URL}/images/${
              order.variant_id?.thumbnail || ""
            }`,
            adminNotes: order.adminNotes || [],
            commentOrder: order.comment || "",
          }));

          setBulkOrders(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* -------------------- SAVE STATUS -------------------- */
  const saveStatusWithNote = async () => {
    if (!selectedOrderId) return;

    try {
      const res = await fetch(
        `/api/v2/bulkorder/update-status/${selectedOrderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: selectedStatus, note }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      setBulkOrders((prev) =>
        prev.map((o) => {
          if (o.id !== selectedOrderId) return o;

          const updatedNotes = [...(o.adminNotes || [])];

          if (note.trim()) {
            updatedNotes.push({
              note,
              status: selectedStatus,
              createdAt: new Date().toISOString(),
            });
          }

          return {
            ...o,
            status: selectedStatus,
            adminNotes: updatedNotes,
          };
        })
      );

      setSelectedOrderId(null);
      setNote("");
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) return <p>Loading bulk orders...</p>;

  /* -------------------- TABLE -------------------- */
  const columns: ColumnDef<BulkOrderRow>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "thumbnail",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.thumbnail}
          alt="thumb"
          className="w-12 h-12 object-cover rounded"
        />
      ),
    },
    { accessorKey: "customer", header: "Institute" },
    { accessorKey: "product", header: "Product" },
    {
      accessorKey: "variantPrice",
      header: "Unit Price",
      cell: ({ row }) =>
        `₹${row.original.variantPrice.toLocaleString("en-IN")}`,
    },
    {
      accessorKey: "customerPrice",
      header: "Institute Price",
      cell: ({ row }) =>
        `₹${row.original.customerPrice.toLocaleString("en-IN", {
        })}`,
    },
    { accessorKey: "quantity", header: "Quantity" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <select
          value={row.original.status}
          className="border rounded px-2 py-1 text-sm"
          onChange={(e) => {
            setSelectedOrderId(row.original.id);
            setSelectedStatus(e.target.value as BulkOrderStatus);
          }}
        >
          {getAllowedStatuses(row.original.status).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link
            to={`/product/${row.original.productId}`}
            target="_blank"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          >
            <EyeIcon className="w-4 h-4 text-gray-600" />
          </Link>

          <button
            onClick={() => setHistoryOrder(row.original)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          >
            <ClockIcon className="w-4 h-4 text-gray-600" />
          </button>

          <button
            onClick={() => setCommentOrder(row.original)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
          >
            <MessageSquare className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ),
    }

  ];

  /* -------------------- RENDER -------------------- */
  return (
    <>
      <DataTable
        data={bulkOrders}
        columns={columns}
        docName="bulk-orders"
        searchColId="product"
        searchPlaceholder="Search By Product Name"
        enableCalender
        dateFieldId="date"
      />

      {/* STATUS NOTE MODAL */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-5 rounded shadow">
            <h3 className="font-semibold mb-2">
              Add Admin Note ({selectedStatus})
            </h3>

            <textarea
              className="w-full border p-2 rounded"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-3">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setSelectedOrderId(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={saveStatusWithNote}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENT MODAL */}
      {commentOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] p-5 rounded shadow-lg">
            <h3 className="font-semibold mb-2">Customer Comment</h3>

            <p className="border p-3 rounded bg-gray-50">{commentOrder.comment || "No comment"}</p>

            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-100"
                onClick={() => setCommentOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* HISTORY MODAL */}
      {historyOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[700px] max-h-[80vh] overflow-y-auto p-6 rounded shadow-lg">
            <h3 className="font-semibold text-lg mb-4">
              Admin Notes History: {historyOrder.product}
            </h3>

            {historyOrder.adminNotes.length === 0 && (
              <p className="text-sm text-gray-500">No notes yet.</p>
            )}

            {historyOrder.adminNotes.map((note, i) => (
              <div key={i} className="mb-4">
                <p className="text-xs text-gray-500 mb-1">
                  {new Date(note.createdAt).toLocaleString()} —{" "}
                  <span className={`font-medium ${STATUS_TEXT_COLOR[note.status]}`}>{note.status}</span>
                </p>
                <p>{note.note}</p>
              </div>
            ))}

            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-100"
                onClick={() => setHistoryOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
