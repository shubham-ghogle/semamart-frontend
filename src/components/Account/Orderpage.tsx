import { useState, useMemo } from "react";
import { useUserStore } from "@/store/userStore";
import { useNavigate } from "react-router-dom";
import { Order, Product, Variant } from "@/Types/types";
import MakePaymentDialog from "./MakePaymentDialog";
import GroupPaymentDialog from "./GroupPaymentDialog";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/data";
import { Filter, Search, X } from "lucide-react"; // Assuming lucide-react is installed

const Orderpage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { user } = useUserStore((state) => state);
  const navigate = useNavigate();

  const { data: orders = [], status } = useQuery({
    queryKey: ["user-orders", user?._id],
    queryFn: async () => {
      if (!user?._id) throw new Error("User not found");
      const res = await fetch(`${API_URL}order/get-all-orders/${user._id}`);
      const data = await res.json();
      if (data.success) return data.orders as Order[];
      throw new Error(data.message);
    },
    enabled: !!user?._id,
  });

  /* ---------------- HELPERS ---------------- */
  const getOrderDate = (order: Order) => new Date(order.createdAt || order.deliveredAt || 0);

  const formatDate = (date: Date) =>
    date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const normalizeImage = (src?: string | null) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("http") || src.startsWith("/")) return src;
    return `/images/${src}`;
  };

  /* ---------------- FILTERING & GROUPING (Memoized) ---------------- */
  const processedGroups = useMemo(() => {
    // 1. Filter
    const filtered = orders.filter((order) => {
      const variant = order.variant as Variant;
      const product = variant?.productId as Product;
      const name = product?.name || "";

      const searchMatch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilters.length === 0 || statusFilters.includes(order.status);

      return searchMatch && statusMatch;
    });

    // 2. Sort
    const sorted = [...filtered].sort(
      (a, b) => getOrderDate(b).getTime() - getOrderDate(a).getTime()
    );

    // 3. Group
    const groups: Order[][] = [];
    const TIME_WINDOW = 60 * 1000;

    sorted.forEach((order) => {
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup) {
        groups.push([order]);
        return;
      }
      const lastTime = getOrderDate(lastGroup[lastGroup.length - 1]).getTime();
      const currentTime = getOrderDate(order).getTime();

      if (Math.abs(currentTime - lastTime) <= TIME_WINDOW) {
        lastGroup.push(order);
      } else {
        groups.push([order]);
      }
    });

    return groups;
  }, [orders, searchTerm, statusFilters]);

  /* ---------------- SUB-COMPONENTS ---------------- */
  const FilterContent = () => (
    <>
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="font-bold text-lg">Filters</h2>
        <button className="md:hidden" onClick={() => setShowMobileFilters(false)}>
          <X size={20} />
        </button>
      </div>
      <div>
        <p className="font-semibold text-xs uppercase mb-3 text-gray-500 tracking-wider">Order Status</p>
        {["Created", "Paid", "Delivered", "Cancelled"].map((s) => (
          <label key={s} className="flex items-center gap-3 mb-3 cursor-pointer text-sm hover:text-blue-600 group">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-600 rounded"
              checked={statusFilters.includes(s)}
              onChange={() =>
                setStatusFilters((prev) =>
                  prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                )
              }
            />
            <span className="group-hover:translate-x-1 transition-transform">
              {s === "Created" ? "Awaiting Payment" : s}
            </span>
          </label>
        ))}
      </div>
    </>
  );

  return (
    <div className="bg-[#f1f3f6] min-h-screen py-4 md:py-6 px-3 md:px-10 text-[#212121]">
      <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:block w-64 bg-white p-5 rounded-sm shadow-sm h-fit sticky top-4">
          <FilterContent />
        </aside>

        {/* MOBILE FILTER OVERLAY */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
            <div className="bg-white w-3/4 h-full p-6 animate-in slide-in-from-left duration-300">
              <FilterContent />
            </div>
          </div>
        )}

        <main className="flex-1">
          {/* SEARCH & MOBILE FILTER TOGGLE */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="w-full pl-10 pr-4 py-2.5 border rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                placeholder="Search your orders here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden bg-white px-4 border rounded-sm shadow-sm flex items-center gap-2 text-sm font-medium"
            >
              <Filter size={16} /> Filter
            </button>
          </div>

          {status === "pending" && (
             <div className="space-y-4">
               {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-sm" />)}
             </div>
          )}

          <div className="space-y-4">
            {processedGroups.map((group, i) => {
              const isGroup = group.length > 1;
              const firstOrder = group[0];

              return (
                <div key={i} className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                  {/* HEADER */}
                  {isGroup && (
                    <div className="bg-[#fffdf8] p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex gap-6 md:gap-10 flex-wrap">
                        <div>
                          <p className="text-[10px] uppercase text-gray-500 font-bold">Order placed</p>
                          <p className="text-sm font-medium">{formatDate(getOrderDate(firstOrder))}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-gray-500 font-bold">Total</p>
                          <p className="text-sm font-bold text-green-700">
                            ₹{group.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      {group.some((o) => o.status === "Created") && (
                        <GroupPaymentDialog orders={group} />
                      )}
                    </div>
                  )}

                  {/* ITEMS */}
                  <div className="divide-y divide-gray-100">
                    {group.map((order) => {
                      const variant = order.variant as Variant;
                      const product = variant?.productId as Product;
                      if (!product) return null;

                      return (
                        <div
                          key={order._id}
                          onClick={() => navigate(`/account/orders/${order._id}`)}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <img
                            src={normalizeImage(variant.thumbnail ?? product.images?.[0])}
                            alt={product.name}
                            className="w-20 h-20 object-contain rounded border border-gray-100 bg-white"
                          />

                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 leading-tight mb-1">{product.name}</h3>
                            <p className="text-xs text-gray-500">Qty: {order.qty}</p>
                            
                            {order.status === "Delivered" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/account/orders/review/${order._id}`);
                                }}
                                className="text-blue-600 text-xs font-bold mt-3 flex items-center hover:underline"
                              >
                                ★ Rate & Review Product
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col sm:items-end min-w-[140px] mt-2 sm:mt-0">
                            <p className="font-bold text-sm">₹{order.totalPrice.toLocaleString("en-IN")}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`w-2 h-2 rounded-full ${order.status === "Delivered" ? "bg-green-600" : order.status === "Cancelled" ? "bg-red-500" : "bg-orange-500"}`}></span>
                              <span className="text-xs font-semibold">
                                {order.status === "Created" ? "Awaiting Payment" : order.status}
                              </span>
                            </div>

                            {!isGroup && order.status === "Created" && (
                              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                                <MakePaymentDialog orderId={order._id} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {processedGroups.length === 0 && status !== "pending" && (
            <div className="bg-white p-16 text-center rounded-sm border shadow-sm">
              <div className="max-w-xs mx-auto">
                <p className="text-gray-500 mb-2 font-medium">No orders found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search terms.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Orderpage;