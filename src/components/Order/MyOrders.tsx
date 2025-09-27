import { useEffect, useState } from "react";
import Header from "../Header/Header";
import { useUserStore } from "@/store/userStore";

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

const MyOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore((state) => state);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/v2/order/get-all-orders/${user._id}`);
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

  // ✅ Normalize image (handles relative filenames & URLs)
  const normalizeImage = (src?: string | null) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
      return src;
    }
    return `/images/${src}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "Invalid Date"
      : d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  // ✅ Filter by product name or order ID
  const filteredOrders = orders.filter((order) => {
    const productName = order.variant?.productId?.name || "";
    return (
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // ✅ Status banner styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Processing":
        return "bg-yellow-100 text-yellow-700";
      case "On the way":
        return "bg-blue-100 text-blue-700";
      case "Cancelled":
      case "Returned":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="font-montserrat">
      <Header />

      <div className="flex flex-col md:flex-row p-6 bg-gray-50 min-h-screen">
        {/* Sidebar Filters */}
        <aside className="md:w-1/4 mb-6 md:mb-0 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          <div className="mb-6">
            <h3 className="font-medium mb-2">ORDER STATUS</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <label className="block">
                <input type="checkbox" className="mr-2" /> On the way
              </label>
              <label className="block">
                <input type="checkbox" className="mr-2" /> Delivered
              </label>
              <label className="block">
                <input type="checkbox" className="mr-2" /> Cancelled
              </label>
              <label className="block">
                <input type="checkbox" className="mr-2" /> Returned
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">ORDER TIME</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <label className="block">
                <input type="checkbox" className="mr-2" /> Last 30 days
              </label>
              <label className="block">
                <input type="checkbox" className="mr-2" /> 2025
              </label>
              <label className="block">
                <input type="checkbox" className="mr-2" /> 2024
              </label>
              <label className="block">
                <input type="checkbox" className="mr-2" /> Older
              </label>
            </div>
          </div>
        </aside>

        {/* Orders Content */}
        <main className="md:w-3/4 md:pl-8">
          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-6">
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

          {/* Error */}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {/* Loading */}
          {loading ? (
            <p>Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <div className="text-5xl mb-4 animate-bounce">📦</div>
              <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
              <p className="text-sm text-gray-400">
                We couldn't find any orders matching your search.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const variant = order.variant;
                const product = variant?.productId;

                if (!product) return null;

                const imageUrl = variant?.thumbnail
                  ? normalizeImage(variant.thumbnail)
                  : product.images && product.images.length > 0
                  ? normalizeImage(product.images[0])
                  : "/placeholder.png";

                return (
                  <div
                    key={order._id}
                    className="border rounded-md p-4 bg-white shadow-sm flex flex-col gap-3"
                  >
                    {/* Status Banner */}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold self-start ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </div>

                    {/* Product Details */}
                    <div className="flex items-start gap-4">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded border"
                      />

                      <div className="flex flex-1 flex-col">
                        <h3 className="text-base font-bold">{product.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {order.qty}</p>
                        {variant && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Variant:</span>{" "}
                            {variant.size ? `Size ${variant.size} ` : ""}
                            {variant.colorOption ? `Color ${variant.colorOption}` : ""}
                          </p>
                        )}
                        {order.shop?.email && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Seller:</span> {order.shop.email}
                          </p>
                        )}
                        <p className="text-sm font-bold mt-1">
                          Total: ₹{order.totalPrice}
                        </p>
                      </div>
                    </div>

                    {/* Shipping + User */}
                    {order.shippingAddress && (
                      <div className="text-xs text-gray-600 mt-2">
                        <p>
                          <span className="font-semibold">Ship To:</span>{" "}
                          {order.shippingAddress.instituteAddress1},{" "}
                          {order.shippingAddress.district},{" "}
                          {order.shippingAddress.state} -{" "}
                          {order.shippingAddress.pincode}
                        </p>
                        {order.shippingAddress.landmark && (
                          <p>Landmark: {order.shippingAddress.landmark}</p>
                        )}
                      </div>
                    )}
                    {order.user && (
                      <div className="text-xs text-gray-600">
                        <p>
                          <span className="font-semibold">Ordered By:</span>{" "}
                          {order.user.firstName} {order.user.lastName}
                        </p>
                        <p>
                          <span className="font-semibold">Phone:</span>{" "}
                          {order.user.phoneNumber}
                        </p>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="text-xs text-gray-500 mt-1">
                      Placed on: {formatDate(order.createdAt)}
                      {order.deliveredAt && (
                        <p>Delivered on: {formatDate(order.deliveredAt)}</p>
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

export default MyOrders;
