import { useEffect, useState } from "react";
import Header from '../Header/Header';
import { useUserStore } from "@/store/userStore";
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  images: string[];
}

interface CartItem {
  product: Product | null; 
  qty: number;
  isReviewed: boolean;
  _id: string;
}

interface Order {
  _id: string;
  cart: CartItem[];
  totalPrice: number;
  status: string;
  deliveredAt?: string;
}

const MyOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
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
        const res = await fetch(`/api/v2/order/get-order/${user._id}`);
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

  // ✅ Safe filtering with null checks
  const filteredOrders = orders.filter(order =>
    order.cart.some(item =>
      item.product !== null &&
      typeof item.product.name === 'string' &&
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="font-montserrat">
      <Header />

      <div className="flex flex-col md:flex-row p-6 bg-gray-50 min-h-screen">
        {/* Sidebar Filters (not yet functional) */}
        <aside className="md:w-1/4 mb-6 md:mb-0 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          <div className="mb-6">
            <h3 className="font-medium mb-2">ORDER STATUS</h3>
            <div className="space-y-1">
              <label className="block"><input type="checkbox" className="mr-2" />On the way</label>
              <label className="block"><input type="checkbox" className="mr-2" />Delivered</label>
              <label className="block"><input type="checkbox" className="mr-2" />Cancelled</label>
              <label className="block"><input type="checkbox" className="mr-2" />Returned</label>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">ORDER TIME</h3>
            <div className="space-y-1">
              <label className="block"><input type="checkbox" className="mr-2" />Last 30 days</label>
              <label className="block"><input type="checkbox" className="mr-2" />2024</label>
              <label className="block"><input type="checkbox" className="mr-2" />2023</label>
              <label className="block"><input type="checkbox" className="mr-2" />2022</label>
              <label className="block"><input type="checkbox" className="mr-2" />2021</label>
              <label className="block"><input type="checkbox" className="mr-2" />Older</label>
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
            <button className="bg-blue-600 text-white py-2 px-3 rounded-md text-center">
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
              <p className="text-sm text-gray-400">We couldn't find any orders matching your search.</p>
            </div>
          ) : ( 
            <div className="space-y-6">
              {filteredOrders.map((order, orderIndex) => (
                <div key={order._id || orderIndex} className="space-y-4">
                  {order.cart.map((item, itemIndex) => {
                    if (!item.product) return null; // ✅ Skip null product safely

                    return (
                      <div
                        key={item._id || itemIndex}
                        className="border rounded-md p-4 bg-white shadow-sm flex items-start space-x-4 cursor-pointer"
                        onClick={() => navigate(`/account/orders/${item.product!._id}`)}
                      >
                        {/* Product Image */}
                        <img
                          src={`/uploads/${item.product.images?.[0] || 'placeholder.png'}`}
                          alt={item.product.name}
                          className="w-16 h-20 object-cover flex-shrink-0 rounded"
                        />

                        {/* Order Info */}
                        <div className="flex flex-wrap items-start justify-between flex-1">
                          <div className="flex flex-col min-w-[200px] mr-6">
                            <h3 className="text-sm font-semibold">{item.product.name}</h3>
                            <p className="text-xs text-gray-600">Quantity: {item.qty}</p>
                          </div>

                          <p className="text-sm text-gray-800 font-medium mr-6 whitespace-nowrap">
                            ₹{order.totalPrice}
                          </p>

                          {order.status === "Delivered" && (
                            <div className="flex flex-col items-start space-y-1 text-xs">
                              <p className="text-green-600 font-medium flex items-center space-x-1">
                                <span className="text-lg leading-none">●</span>
                                <span>Delivered on {formatDate(order.deliveredAt)}</span>
                              </p>
                              {!item.isReviewed && (
                                <p className="text-blue-600 hover:underline font-medium cursor-pointer">
                                  ★ Rate & Review Product
                                </p>
                              )}
                            </div>
                          )}

                          {order.status === "Refund" && (
                            <div className="flex flex-col items-start space-y-1 text-xs max-w-xs">
                              <p className="text-yellow-600 font-medium flex items-center space-x-1">
                                <span className="text-lg leading-none">●</span>
                                <span>Refund Completed</span>
                              </p>
                              <p className="text-gray-600">
                                You returned this order because the quality was not as expected.
                              </p>
                            </div>
                          )}

                          {order.status === "Order Not Placed" && (
                            <div className="flex flex-col items-start space-y-1 text-xs max-w-xs">
                              <p className="text-red-600 font-medium flex items-center space-x-1">
                                <span className="text-lg leading-none">●</span>
                                <span>Order Not Placed</span>
                              </p>
                              <p className="text-red-600">There was an issue placing this order.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyOrders;
