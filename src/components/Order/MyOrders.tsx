import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useNavigate } from "react-router-dom";
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

  // ✅ Normalize image (handles relative filenames & URLs)
  const normalizeImage = (src?: string | null) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
      return src;
    }
    return `/images/${src}`;
  };

  // const formatDate = (dateStr?: string) => {
  //   if (!dateStr) return "N/A";
  //   const d = new Date(dateStr);
  //   return isNaN(d.getTime())
  //     ? "Invalid Date"
  //     : d.toLocaleDateString(undefined, {
  //         month: "short",
  //         day: "numeric",
  //         year: "numeric",
  //       });
  // };

  // ✅ Filter by product name or order ID
  const filteredOrders = orders.filter((order) => {
    const productName = order.variant?.productId?.name || "";
    return (
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // ✅ Status banner styles
  // const getStatusStyle = (status: string) => {
  //   switch (status) {
  //     case "Delivered":
  //       return "bg-green-100 text-green-700";
  //     case "Processing":
  //       return "bg-yellow-100 text-yellow-700";
  //     case "On the way":
  //       return "bg-blue-100 text-blue-700";
  //     case "Cancelled":
  //     case "Returned":
  //       return "bg-red-100 text-red-700";
  //     default:
  //       return "bg-gray-100 text-gray-700";
  //   }
  // };
  const navigate = useNavigate();

const handleOrderClick = (productId: string) => {
  navigate(`/account/orders/${productId}`);
};


  return (

      <div>
      <nav className="text-sm text-gray-500 mb-6 ml-20 mt-5">
            <ul className="flex gap-2 items-center">
              <li>
                <Link to="/" className="hover:text-blue-600">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/account" className="hover:text-blue-600">My Account</Link>
              </li>
              <li>/</li>
              <li className="font-semibold text-gray-800">My Orders</li>
            </ul>
          </nav>
      <div className="flex flex-col md:flex-row ml-20 mr-20 mt-6 bg-gray-50 min-h-screen">
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

         {/* Loading / Error / Empty */}
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
              {filteredOrders.map((order) => {
                const variant = order.variant;
                const product = variant?.productId;
                if (!product) return null;

                const imageUrl = normalizeImage(
                  variant?.thumbnail ??
                    product.images?.[0] ??
                    "/placeholder.png"
                );

                return (
                    <div
                  key={order._id}
                  onClick={() => handleOrderClick(product._id)}
                  className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-4 cursor-pointer"
                >
                  {/* Row container */}
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                    {/* 🖼️ Image column */}
                    <div className="md:col-span-2 flex justify-center md:justify-start">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>

                    {/* 🏷️ Name & variant column */}
                    <div className="md:col-span-5">
                      <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
                        {product.name.split(" ").slice(0, 8).join(" ")}
                        {product.name.split(" ").length > 8 && "..."}
                      </h3>

                      <div className="text-gray-600 text-sm mt-1">
                        {variant?.colorOption && (
                          <span>
                            Color:{" "}
                            <span className="font-medium text-gray-700">{variant.colorOption}</span>
                          </span>
                        )}
                        {variant?.size && (
                          <span className="ml-4">
                            Size:{" "}
                            <span className="font-medium text-gray-700">{variant.size}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 💰 Price column */}
                    <div className="md:col-span-2 text-center">
                      <p className="text-lg font-semibold text-gray-900">₹{order.totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                    </div>

                    {/* 🚚 Delivery status & review column */}
                   <div className="md:col-span-3 text-sm text-right">
                      {/* 🟢 Status */}
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

                      {/* 📦 Delivery text */}
                      <p className="text-xs text-gray-500 mt-1">
                        {order.status === "Delivered"
                          ? `Delivered on ${new Date(order.deliveredAt || "").toLocaleDateString()}`
                          : `Your item is ${order.status.toLowerCase()}`}
                      </p>

                      {/* ⭐ Rate & Review */}
                      <button className="text-blue-600 hover:underline text-sm font-medium mt-2 inline-flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-4 h-4 text-blue-600"
                        >
                          <path d="M12 17.27L18.18 21l-1.63-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.45 4.73L5.82 21z" />
                        </svg>
                        Rate & Review
                      </button>
                    </div>


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
