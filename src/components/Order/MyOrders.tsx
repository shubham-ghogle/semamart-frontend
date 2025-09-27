import { useEffect, useState } from "react";
import Header from "../Header/Header";
import { useUserStore } from "@/store/userStore";
import { useNavigate } from "react-router-dom";

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
  createdAt?: string;
}

const MyOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
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
                    className="border rounded-md p-4 bg-white shadow-sm flex items-start gap-4 cursor-pointer"
                    onClick={() => navigate(`/account/orders/${order._id}`)}
                  >
                    {/* Product Image */}
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded border"
                    />

                    {/* Order Info */}
                    <div className="flex flex-1 flex-col">
                      <h3 className="text-sm font-semibold">{product.name}</h3>
                      <p className="text-xs text-gray-600">Quantity: {order.qty}</p>
                      {variant?.size && (
                        <p className="text-xs text-gray-500">Size: {variant.size}</p>
                      )}
                      {variant?.colorOption && (
                        <p className="text-xs text-gray-500">
                          Color: {variant.colorOption}
                        </p>
                      )}
                      {order.shop?.email && (
                        <p className="text-xs text-gray-500">
                          Sold by: {order.shop.email}
                        </p>
                      )}
                      <p className="text-sm font-medium mt-1">₹{order.totalPrice}</p>
                      <p className="text-xs text-gray-500 mt-1">Status: {order.status}</p>
                      {order.status === "Delivered" && order.deliveredAt && (
                        <p className="text-green-600 text-xs font-medium">
                          Delivered on {formatDate(order.deliveredAt)}
                        </p>
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
