import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useNavigate } from "react-router-dom";
import { Order, Product, Variant } from "@/Types/types";
import MakePaymentDialog from "./MakePaymentDialog";
import GroupPaymentDialog from "./GroupPaymentDialog";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/data";

const Orderpage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUserStore((state) => state);
  const navigate = useNavigate();

  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [timeFilters, setTimeFilters] = useState<string[]>([]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const {
    data: orders,
    status: loading,
    error,
  } = useQuery({
    queryKey: ["user-orders", user?._id],
    queryFn: async () => {
      if (!user?._id) throw new Error();
      const res = await fetch(`${API_URL}order/get-all-orders/${user._id}`);
      const data = await res.json();
      if (data.success) {
        return data.orders as Order[];
      } else {
        throw new Error(data.message || "Failed to fetch orders.");
      }
    },
  });

  /* ---------------- helpers ---------------- */

  const normalizeImage = (src?: string | null) => {
    if (!src) return "/placeholder.png";
    if (
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/")
    )
      return src;
    return `/images/${src}`;
  };

  const getOrderDate = (order: Order): Date => {
    if (order.createdAt) return new Date(order.createdAt);
    if (order.deliveredAt) return new Date(order.deliveredAt);
    return new Date(0);
  };

  const formatIndianDateTime = (date: Date) =>
    date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const getStatusInfo = (order: Order) => {
    if (order.status === "Created") {
      if (order.paymentInfo?.status === "Failed") {
        return {
          label: "Payment failed - pay again",
          color: "bg-red-500",
        };
      }
      if (order.paymentFile) {
        return {
          label: "Waiting for payment verification",
          color: "bg-yellow-500",
        };
      }
      return {
        label: "Awaiting payment",
        color: "bg-yellow-500",
      };
    }

    if (order.status === "Paid") {
      return {
        label: "Payment received — processing",
        color: "bg-yellow-500",
      };
    }

    if (order.status === "Delivered") {
      return {
        label: "Delivered",
        color: "bg-green-500",
      };
    }

    if (order.status === "Cancelled") {
      return {
        label: "Cancelled",
        color: "bg-red-500",
      };
    }

    return { label: order.status, color: "bg-gray-500" };
  };

  /* ---------------- filtering ---------------- */

  const filteredOrders = orders?.filter((order) => {
    let productName = "";
    const variant = order.variant as Variant;
    const product = variant?.productId as Product;

    if (product) productName = product.name;

    const statusMatch =
      statusFilters.length === 0 || statusFilters.includes(order.status);

    const searchMatch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());

    let timeMatch = true;

    if (timeFilters.length > 0) {
      const now = new Date();
      const orderDate = getOrderDate(order);

      const diffDays =
        (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);

      timeMatch = timeFilters.some((filter) => {
        switch (filter) {
          case "Last 30 days":
            return diffDays <= 30;
          case "2025":
            return orderDate.getFullYear() === 2025;
          case "2024":
            return orderDate.getFullYear() === 2024;
          case "Older":
            return orderDate.getFullYear() < 2024;
          default:
            return true;
        }
      });
    }

    return statusMatch && timeMatch && searchMatch;
  });

  const handleOrderClick = (productId: string) => {
    navigate(`/account/orders/${productId}`);
  };

  const isOnlinePaidOrder = (order: Order) => {
    const method = (order.paymentInfo?.method || "").toLowerCase();
    return ["hdfc", "online", "razorpay"].includes(method);
  };

  const canOpenOrderDetails = (order: Order) => {
    if (order.status === "Created") return false;
    if (order.status === "Paid" && !isOnlinePaidOrder(order)) return false;
    return true;
  };

  /* ---------------- GROUP BY createdAt (DESC) ---------------- */

  const sortedOrders = [...(filteredOrders ?? [])].sort(
    (a, b) => getOrderDate(b).getTime() - getOrderDate(a).getTime()
  );

  const TIME_WINDOW_MS = 15 * 60 * 1000;
  const groupedOrders: Order[][] = [];

  sortedOrders.forEach((order) => {
    const orderTime = getOrderDate(order).getTime();
    const lastGroup = groupedOrders[groupedOrders.length - 1];

    if (!lastGroup) {
      groupedOrders.push([order]);
      return;
    }

    const lastOrderTime = getOrderDate(
      lastGroup[lastGroup.length - 1]
    ).getTime();

    if (Math.abs(orderTime - lastOrderTime) <= TIME_WINDOW_MS) {
      lastGroup.push(order);
    } else {
      groupedOrders.push([order]);
    }
  });

  /* ---------------- render ---------------- */

  return (
    <div className="bg-white py-6 px-4 md:px-10 mt-4">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden md:block md:w-1/4 bg-white rounded-xl p-4 shadow-md sticky top-24 self-start max-h-[calc(100vh-96px)] overflow-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Filters</h2>

          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-800 uppercase tracking-wide">
              Order Status
            </h3>
            {["Created", "Processing", "Shipped", "Delivered"].map((status) => (
              <label key={status} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={statusFilters.includes(status)}
                  onChange={() =>
                    setStatusFilters((prev) =>
                      prev.includes(status)
                        ? prev.filter((s) => s !== status)
                        : [...prev, status]
                    )
                  }
                  className="mr-3"
                />
                {status}
              </label>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-800 uppercase tracking-wide">
              Order Time
            </h3>
            {["Last 30 days", "2025", "2024", "Older"].map((time) => (
              <label key={time} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={timeFilters.includes(time)}
                  onChange={() =>
                    setTimeFilters((prev) =>
                      prev.includes(time)
                        ? prev.filter((t) => t !== time)
                        : [...prev, time]
                    )
                  }
                  className="mr-3"
                />
                {time}
              </label>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="w-full md:w-3/4">

          {/* Mobile Filters */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="bg-blue-600 text-white px-4 py-2 w-full rounded-md mb-3"
            >
              Filters
            </button>

            {showFiltersMobile && (
              <div className="bg-white shadow-md rounded-xl p-4">
                <h3 className="font-semibold mb-2">Order Status</h3>
                {["Created", "Processing", "Shipped", "Delivered"].map((status) => (
                  <label key={status} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={statusFilters.includes(status)}
                      onChange={() =>
                        setStatusFilters((prev) =>
                          prev.includes(status)
                            ? prev.filter((s) => s !== status)
                            : [...prev, status]
                        )
                      }
                      className="mr-3"
                    />
                    {status}
                  </label>
                ))}

                <h3 className="font-semibold mt-4 mb-2">Order Time</h3>
                {["Last 30 days", "2025", "2024", "Older"].map((time) => (
                  <label key={time} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={timeFilters.includes(time)}
                      onChange={() =>
                        setTimeFilters((prev) =>
                          prev.includes(time)
                            ? prev.filter((t) => t !== time)
                            : [...prev, time]
                        )
                      }
                      className="mr-3"
                    />
                    {time}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-8">
            <input
              type="text"
              className="flex-grow border rounded-lg px-5 py-3"
              placeholder="Search your orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
              Search
            </button>
          </div>

          {loading === "pending" && (
            <p className="text-center text-gray-600">Loading orders...</p>
          )}

          {error && (
            <p className="text-red-600 text-center">{error.message}</p>
          )}

          {groupedOrders.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No orders found.
            </div>
          )}

          {/* ORDER LIST */}
          <div className="space-y-8">
            {groupedOrders.map((group, gIdx) => (
              <div
                key={gIdx}
                className="border-l-4 border-yellow-400 bg-yellow-50 rounded-xl p-4 space-y-4"
              >
                {group.length > 1 && (
                  <div className="border-b pb-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Order placed</p>
                        <p className="font-semibold text-gray-900">
                          {formatIndianDateTime(getOrderDate(group[0]))}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-semibold text-gray-900">
                          ₹
                          {group
                            .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
                            .toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Ship to</p>
                        <p className="font-semibold text-gray-900 truncate">
                          {group[0]?.shippingAddress?.instituteAddress1 || "NA"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {group[0]?.shippingAddress?.district || ""}
                          {group[0]?.shippingAddress?.state
                            ? `, ${group[0].shippingAddress.state}`
                            : ""}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Placed by</p>
                        <p className="font-semibold text-gray-900 truncate">
                          {user?.instituteName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "NA"}
                        </p>
                      </div>

                    </div>

                    <div className="mt-3 flex justify-end">
                      {group.some(
                        (o) =>
                          o.status === "Created" ||
                          (o.status === "Paid" && o.paymentInfo?.status === "Failed"),
                      ) && <GroupPaymentDialog orders={group} />}
                    </div>
                  </div>
                )}

                {group.map((order) => {
                  const variant = order.variant as Variant;
                  const product = variant?.productId as Product;
                  if (!product) return null;

                  const statusInfo = getStatusInfo(order);

                  return (
                    <div
                      key={order._id}
                      onClick={() => canOpenOrderDetails(order) && handleOrderClick(order._id)}
                      className="bg-white border rounded-2xl shadow-sm hover:shadow-lg transition p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 cursor-pointer"
                    >
                      <div className="sm:col-span-2">
                        <img
                          src={normalizeImage(
                            variant.thumbnail ?? product.images?.[0]
                          )}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      </div>

                      <div className="sm:col-span-5 min-w-0">
                        <h3 className="text-md font-semibold text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Quantity: {order.qty}
                        </p>
                      </div>

                      <div className="sm:col-span-2 text-center">
                        <p className="text-lg font-bold">
                          ₹{order.totalPrice.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="sm:col-span-3 flex flex-col items-end space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${statusInfo.color}`}
                          />
                          <p className="font-semibold text-gray-900">
                            {statusInfo.label}
                          </p>
                        </div>

                        {group.length === 1 &&
                          order.status === "Created" &&
                          !order.paymentFile && (
                          <MakePaymentDialog orderId={order._id} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Orderpage;
