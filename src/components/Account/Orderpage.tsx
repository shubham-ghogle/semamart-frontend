import {  useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useNavigate } from "react-router-dom";
import { Order, Product, Variant } from "@/Types/types";
import MakePaymentDialog from "./MakePaymentDialog";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/data";

const Orderpage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUserStore((state) => state);
  const navigate = useNavigate();

  // New state for filters
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [timeFilters, setTimeFilters] = useState<string[]>([]);

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

  // Normalize image (handles relative filenames & URLs)
  const normalizeImage = (src?: string | null) => {
    if (!src) return "/placeholder.png";
    if (
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/")
    ) {
      return src;
    }
    return `/images/${src}`;
  };

  // Handle checkbox toggle helpers
  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const toggleTimeFilter = (time: string) => {
    setTimeFilters((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );
  };

  // Filter orders based on search, status and time filters
  const filteredOrders = orders?.filter((order) => {
    let productName = "";
    if (typeof order.variant !== "string" && order.variant) {
      const product = order.variant.productId;

      if (typeof product !== "string" && product) {
        productName = product.name ?? "";
      }
    }
    const statusMatch =
      statusFilters.length === 0 || statusFilters.includes(order.status);
    const searchMatch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());

    // Time filter logic: filter orders by createdAt or deliveredAt date
    let timeMatch = true;
    if (timeFilters.length > 0) {
      const now = new Date();
      const orderDate = order.createdAt
        ? new Date(order.createdAt)
        : order.deliveredAt
          ? new Date(order.deliveredAt)
          : null;

      if (!orderDate) return false;

      timeMatch = timeFilters.some((filter) => {
        const diffDays =
          (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
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

  return (
    <div className=" bg-white py-10 px-4 md:px-10 mt-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="md:w-1/4 bg-white rounded-xl p-4 shadow-md sticky top-24 self-start max-h-[calc(100vh-96px)] overflow-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Filters</h2>

          <div className="mb-8">
            <h3 className="font-semibold mb-3 text-gray-800 uppercase tracking-wide">
              Order Status
            </h3>
            <div className="space-y-3 text-gray-700 text-sm">
              {["On the way", "Delivered", "Cancelled", "Returned"].map(
                (status) => (
                  <label
                    key={status}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={statusFilters.includes(status)}
                      onChange={() => toggleStatusFilter(status)}
                      className="mr-3 w-4 h-4 rounded"
                    />
                    {status}
                  </label>
                ),
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-800 uppercase tracking-wide">
              Order Time
            </h3>
            <div className="space-y-3 text-gray-700 text-sm">
              {["Last 30 days", "2025", "2024", "Older"].map((time) => (
                <label key={time} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={timeFilters.includes(time)}
                    onChange={() => toggleTimeFilter(time)}
                    className="mr-3 w-4 h-4 rounded"
                  />
                  {time}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Orders Content */}
        <main className="md:w-3/4">
          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-8">
            <input
              type="text"
              className="flex-grow border border-gray-300 rounded-lg px-5 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search your orders here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {}}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-600 mb-6 font-medium text-center">
              {error.message}
            </p>
          )}

          {/* Loading / Error / Empty */}
          {loading === "pending" ? (
            <p className="text-center text-gray-600">Loading orders...</p>
          ) : loading === "error" ? (
            <p className="text-red-600 text-center">{error.message}</p>
          ) : filteredOrders?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="text-6xl mb-5 animate-bounce select-none">📦</div>
              <h2 className="text-2xl font-semibold mb-2">No Orders Found</h2>
              <p className="text-base max-w-md text-center">
                We couldn't find any orders matching your search and filters.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders?.map((order) => {
                const variant = order.variant as Variant;
                const product = variant?.productId as Product;
                if (!product) return null;

                const imageUrl = normalizeImage(
                  variant?.thumbnail ??
                    product.images?.[0] ??
                    "/placeholder.png",
                );

                return (
                  <div
                    key={order._id}
                    onClick={() => {
                      if (order.status !== "Created") {
                        handleOrderClick(product._id);
                      }
                    }}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg cursor-pointer transition p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                  >
                    {/* Image */}
                    <div className="md:col-span-2 flex justify-center md:justify-start">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-28 h-28 object-cover rounded-lg border border-gray-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Name & Variant */}
                    <div className="md:col-span-5">
                      <h3 className="text-md font-semibold text-gray-900 line-clamp-2">
                        {product.name.split(" ").slice(0, 8).join(" ")}
                        {product.name.split(" ").length > 8 && "..."}
                      </h3>
                      <div className="text-gray-600 text-sm mt-2 flex flex-wrap gap-4">
                        {variant?.colorOption && (
                          <span>
                            <span className="font-semibold text-gray-800">
                              Color:
                            </span>{" "}
                            {variant.colorOption}
                          </span>
                        )}
                        {variant?.size && (
                          <span>
                            <span className="font-semibold text-gray-800">
                              Size:
                            </span>{" "}
                            {variant.size}
                          </span>
                        )}
                        <span>
                          <span className="font-semibold text-gray-800">
                            Quantity:
                          </span>{" "}
                          {order.qty || 1}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 text-center">
                      <p className="text-md font-bold text-gray-900">
                        ₹{order.totalPrice.toFixed(2)}
                      </p>
                    </div>

                    {/* Status & Review */}
                    <div className="md:col-span-3 text-right text-sm space-y-1">
                      <div className="font-semibold flex items-center justify-end gap-2 text-gray-900">
                        {order.status === "Created" &&
                          (order.paymentFile ? (
                            <p>Waiting for payment verification</p>
                          ) : (
                            <MakePaymentDialog orderId={order._id} />
                          ))}
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            order.status === "Delivered"
                              ? "bg-green-500"
                              : order.status === "Cancelled"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        ></span>
                        {order.status === "Paid"
                          ? "Waiting for payment verification"
                          : order.status}
                      </div>

                      {order.status === "Delivered" && (
                        <p className="text-gray-500 truncate max-w-full">
                          {`Delivered on ${new Date(
                            order.deliveredAt || "",
                          ).toLocaleDateString()}`}
                        </p>
                      )}

                      {order.status === "Delivered" && (
                        <button className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                          >
                            <path d="M12 17.27L18.18 21l-1.63-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.45 4.73L5.82 21z" />
                          </svg>
                          Rate & Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Orderpage;
