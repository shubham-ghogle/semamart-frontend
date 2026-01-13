import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { API_URL } from "@/data";

interface Product {
  _id: string;
  name: string;
  images?: string[];
}

interface Variant {
  _id: string;
  size?: string | null;
  colorOption?: string | null;
  thumbnail?: string | null;
  productId?: Product;
}

interface Order {
  _id: string;
  variant?: Variant | null;
  qty?: number;
  totalPrice: number;
  status: string;
  deliveredAt?: string;
  createdAt?: string;
  shop?: { _id: string; email: string };
  shippingAddress?: {
    state: string;
    district: string;
    instituteAddress1: string;
    instituteAddress2?: string;
    pincode: string;
    landmark?: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

const MyOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);

  const { user } = useUserStore((state) => state);
  const navigate = useNavigate();

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const res = await fetch(`${API_URL}order/get-all-orders/${user._id}`);
        const data = await res.json();

        if (data.success) {
          setOrders(data.orders);
          setError(null);
        } else {
          setError(data.message || "Failed to fetch orders.");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Error fetching orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleOrderClick = (productId: string) => {
    navigate(`/account/orders/${productId}`);
  };

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

  // Filter orders by search, status, and time
  const filteredOrders: Order[] = orders.filter((order: Order) => {
    const productName = order.variant?.productId?.name || "";
    const matchesSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    let matchesTime = true;
    if (timeFilter === "Last 30 days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchesTime = new Date(order.createdAt || "") >= thirtyDaysAgo;
    } else if (timeFilter === "2025") {
      matchesTime = new Date(order.createdAt || "").getFullYear() === 2025;
    } else if (timeFilter === "2024") {
      matchesTime = new Date(order.createdAt || "").getFullYear() === 2024;
    } else if (timeFilter === "Older") {
      matchesTime = new Date(order.createdAt || "").getFullYear() < 2024;
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  const statusOptions = ["Created", "Processing", "Shipped", "Delivered"];
  const timeOptions = ["Last 30 days", "2025", "2024", "Older"];

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 ml-20 mt-5">
        <ul className="flex gap-2 items-center">
          <li>
            <Link to="/" className="hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/account" className="hover:text-blue-600">
              My Account
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-gray-800">My Orders</li>
        </ul>
      </nav>

      <div className="flex flex-col ml-20 mr-20 mt-6 bg-gray-50 min-h-screen">
        {/* Filters & Search Row */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 gap-4">
          {/* Search Input */}
          <div className="flex items-center space-x-2 w-full md:w-1/2">
            <input
              type="text"
              className="border border-gray-300 px-4 py-2 w-full rounded-md"
              placeholder="Search your orders here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-blue-600 text-white py-2 px-3 rounded-md">
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap md:flex-nowrap">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(statusFilter === status ? null : status)
                  }
                  className={`px-3 py-1 rounded-full border text-sm ${
                    statusFilter === status
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Time Filter */}
            <div className="flex gap-2 flex-wrap">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => (timeFilter === time ? setTimeFilter(null) : setTimeFilter(time))}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    timeFilter === time
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <p>Loading orders...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="text-5xl mb-4 animate-bounce">📦</div>
            <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
            <p className="text-sm text-gray-400">
              We couldn't find any orders matching your search.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: Order) => {
              const variant = order.variant;
              const product = variant?.productId;
              if (!product) return null;

              const imageUrl = normalizeImage(
                variant?.thumbnail ?? product.images?.[0] ?? "/placeholder.png"
              );

              return (
                <div
                  key={order._id}
                  onClick={() => handleOrderClick(product._id)}
                  className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-4 cursor-pointer"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                    <div className="md:col-span-2 flex justify-center md:justify-start">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>

                    <div className="md:col-span-5">
                      <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
                        {product.name.split(" ").slice(0, 8).join(" ")}
                        {product.name.split(" ").length > 8 && "..."}
                      </h3>
                      <div className="text-gray-600 text-sm mt-1">
                        {variant?.colorOption && (
                          <span>
                            Color:{" "}
                            <span className="font-medium text-gray-700">
                              {variant.colorOption}
                            </span>
                          </span>
                        )}
                        {variant?.size && (
                          <span className="ml-4">
                            Size:{" "}
                            <span className="font-medium text-gray-700">
                              {variant.size}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2 text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹
                        {order.totalPrice.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="md:col-span-3 text-sm text-right">
                      <div className="font-medium text-gray-800">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
                            order.status === "Delivered"
                              ? "bg-green-500"
                              : order.status === "Cancelled"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        ></span>
                        {order.status}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.status === "Delivered"
                          ? `Delivered on ${new Date(
                              order.deliveredAt || ""
                            ).toLocaleDateString()}`
                          : `Your item is ${order.status.toLowerCase()}`}
                      </p>
                      <button className="text-blue-600 hover:underline text-sm font-medium mt-2 inline-flex items-center gap-1">
                        Rate & Review
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
