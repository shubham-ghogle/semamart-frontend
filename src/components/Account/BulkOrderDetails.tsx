import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, ClockIcon } from "lucide-react";
import { Link } from "react-router";
import { useUserStore } from "@/store/userStore";
import { BASE_URL } from "@/data";

type AdminNote = {
  note: string;
  status: string;
  createdAt: string;
};

type BulkOrderRow = {
  id: string;
  productId: string;
  date: string;
  product: string;
  variantPrice: number;
  quantity: number;
  status: string;
  customerPrice: number;
  thumbnail: string;
  adminNotes: AdminNote[];
  viewOrder: (id: string) => void;
};

export default function BulkOrderDetails() {
  const [bulkOrders, setBulkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyOrder, setHistoryOrder] = useState<BulkOrderRow | null>(null); // HISTORY MODAL STATE
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchBulkOrders = async () => {
      try {
        const res = await fetch(`/api/v2/bulkorder/bulk-orders/user/${user?._id}`);
        if (!res.ok) throw new Error("Failed to fetch bulk orders");

        const data = await res.json();
        if (data.success) {
          setBulkOrders(data.bulkOrders);
        } else {
          setError("Failed to load bulk orders");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBulkOrders();
  }, [user?._id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg font-medium">Loading bulk orders...</span>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 mt-8">
        <p className="text-xl font-semibold">Oops! Something went wrong.</p>
        <p>{error}</p>
      </div>
    );

  const rows: BulkOrderRow[] = bulkOrders.map((order) => ({
    id: order._id,
    productId: order.product_id._id,
    date: new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    product: order.product_id.name,
    variantPrice: order.variant_id?.discountPrice || 0,
    quantity: order.quantity,
    status: order.status || "-",
    customerPrice: order.customerPrice || 0,
    thumbnail: BASE_URL + "images/" + (order.variant_id?.thumbnail || ""),
    adminNotes: order.adminNotes || [], // Add adminNotes
    viewOrder: (id) => navigate(`/bulk-orders/${id}`),
  }));

  // Status color mapping
    const statusColors: Record<string, string> = {
    NEW: "text-blue-700 bg-blue-100",
    CONTACTED: "text-indigo-700 bg-indigo-100",
    APPROVED: "text-green-700 bg-green-100",
    REJECTED: "text-red-700 bg-red-100",
    CLOSED: "text-gray-700 bg-gray-200",
    };


  const columns: ColumnDef<BulkOrderRow>[] = [
    { accessorKey: "date", header: "Date" },
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
    { accessorKey: "product", header: "Product" },
    {
      accessorKey: "variantPrice",
      header: "Unit Price",
      cell: ({ row }) =>
        `₹${row.original.variantPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      accessorKey: "customerPrice",
      header: "My Price",
      cell: ({ row }) =>
        `₹${row.original.customerPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}`,
    },
    { accessorKey: "quantity", header: "Quantity" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            statusColors[row.original.status] || "text-gray-700 bg-gray-100"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/product/${row.original.productId}`}
            target="_blank"
            className="inline-flex items-center justify-center p-2 rounded-md  transition"
          >
            <EyeIcon className="w-4 h-4" />
          </Link>

          {/* History Icon */}
          <span
            onClick={() => setHistoryOrder(row.original)}
            className="cursor-pointer text-gray-600 hover:text-gray-900"
            title="View Admin History"
          >
            <ClockIcon className="w-5 h-5" />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Bulk Orders</h2>
      <DataTable
        data={rows}
        columns={columns}
        docName="bulk-orders"
        searchColId="product"
        searchPlaceholder="Search By Product Name"
        enableCalender={true}
        dateFieldId="date"
      />

      {/* -------------------- HISTORY MODAL -------------------- */}
      {historyOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[700px] max-h-[80vh] overflow-y-auto p-6 rounded shadow-lg">
            <h3 className="font-semibold text-lg mb-4">
              Admin Notes History: {historyOrder.product}
            </h3>

            <div className="border-l-2 border-gray-300 pl-4">
              {historyOrder.adminNotes.length === 0 && (
                <p className="text-sm text-gray-500">No notes yet.</p>
              )}

              {historyOrder.adminNotes.map((note, i) => (
                <div key={i} className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                  <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[note.status] || "text-gray-700 bg-gray-100"
                      }`}
                    >
                      {note.status}
                    </span>
                  <p>{note.note}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <span
                onClick={() => setHistoryOrder(null)}
                className="cursor-pointer px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
