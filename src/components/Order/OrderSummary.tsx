import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import Header from "../Header/Header";
import { useUserStore } from "@/store/userStore";
import OrderBreadcrumb from "../ui/OrderBredcrum"; 
import { FiDownload, FiLoader, FiPackage, FiTruck, FiCheckCircle } from "react-icons/fi";
import { FaUser, FaHome, FaCreditCard } from "react-icons/fa";
import { API_URL } from "@/data";
import { toast } from "react-toastify";
import StarRating from "../Order/StarRating";

// --- Interfaces ---
interface Product { _id: string; name: string; images?: string[]; manufacturerName?: string; }
interface Variant { _id: string; colorOption?: string; size?: string; originalPrice: number; discountPrice: number; productId?: Product; thumbnail?: string; }
interface Order { _id: string; variant?: Variant; qty: number; totalPrice: number; status: string; createdAt?: string; paymentFile?: string; shippingAddress?: { state: string; district: string; instituteAddress1: string; pincode: string; reciever_name: string; phone: string; }; paymentInfo?: { method?: string; status?: string; transactionId?: string; }; statusHistory?: { _id: string; status: string; updatedAt: string; }[]; review?: { _id: string; rating: number; comment: string; images?: string[]; } | null; shop?: { businessName?: string; }; }

const OrderSummary = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useUserStore((state) => state);
  const navigate = useNavigate(); // Initialize navigate

  const [order, setOrder] = useState<Order | null>(null);
  const [orderedProduct, setOrderedProduct] = useState<Variant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reviewData, setReviewData] = useState<{ _id?: string; rating: number; comment: string; images: (File | string)[]; }>({
    rating: 0, comment: "", images: [],
  });

  const normalizeImage = (src?: string | null): string => {
    if (!src) return "/placeholder.png";
    if (/^(https?:\/\/|\/)/.test(src)) return src;
    return src.startsWith("uploads/") ? `/${src}` : `/images/${src}`;
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!user?._id || !productId) return;
      try {
        const res = await fetch(`${API_URL}order/get-all-orders/${user._id}`);
        const data = await res.json();
        if (!data.success) throw new Error("Order fetch failed");
        
        const foundOrder = data.orders.find((o: Order) => o._id === productId) || 
                           data.orders.find((o: Order) => o.variant?.productId?._id === productId);
        
        if (!foundOrder) { setError("Order not found"); return; }
        setOrder(foundOrder);
        setOrderedProduct(foundOrder.variant!);
        setProduct(foundOrder.variant?.productId || null);
      } catch (err: any) { setError(err.message); }
    };
    fetchOrderData();
  }, [user?._id, productId]);

  useEffect(() => {
    if (order?.review) {
      setReviewData({
        _id: order.review._id,
        rating: order.review.rating,
        comment: order.review.comment || "",
        images: order.review.images || [],
      });
    }
  }, [order?.review]);

  const unitPrice = orderedProduct?.discountPrice || 0;
  const qty = order?.qty || 0;
  const totalAmount = unitPrice * qty;
  const gstAmount = Math.max(0, (order?.totalPrice || 0) - totalAmount);
  const displayPaymentStatus = order?.paymentInfo?.status === "Pending" && ["Packed", "Shipped", "Delivered"].includes(order.status) ? "Paid" : (order?.paymentInfo?.status || "Pending");

  const handleSubmitReview = async () => {
    if (!reviewData.rating) { toast.error("Please add a rating"); return; }
    const formData = new FormData();
    formData.append("user", user?._id || "");
    formData.append("productId", product?._id || "");
    formData.append("orderId", order?._id || "");
    formData.append("rating", reviewData.rating.toString());
    formData.append("comment", reviewData.comment);
    reviewData.images.forEach(img => { if (img instanceof File) formData.append("images", img); });

    try {
      const endpoint = reviewData._id ? `review/updateReview/${reviewData._id}` : `review/addReview`;
      const res = await fetch(`${API_URL}${endpoint}`, { method: reviewData._id ? "PUT" : "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success("Feedback saved!");
        setOrder(prev => prev ? { ...prev, review: data.review } : prev);
      }
    } catch (err) { toast.error("Review failed to save"); }
  };

  const handleDownloadInvoice = async (id?: string) => {
    if (!id || order?.status !== "Delivered") { toast.error("Available after delivery"); return; }
    setIsDownloading(true);
    try {
      const res = await fetch(`${API_URL}order/invoice/${id}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
    } catch (e) { toast.error("Download failed"); } finally { setIsDownloading(false); }
  };

  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!order || !orderedProduct) return <div className="flex justify-center py-20"><FiLoader className="animate-spin" size={40} /></div>;

  const statusSteps = [
    { key: "Packed", color: "bg-blue-600", icon: <FiPackage /> },
    { key: "Shipped", color: "bg-orange-500", icon: <FiTruck /> },
    { key: "Delivered", color: "bg-green-600", icon: <FiCheckCircle /> },
  ];
  const safeCurrentIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-10">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <OrderBreadcrumb orderId={order._id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Clickable Product Image */}
                  <div 
                    onClick={() => navigate(`/product/${product?._id}`)} 
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img 
                      src={normalizeImage(orderedProduct.thumbnail ?? product?.images?.[0])} 
                      alt="product" 
                      className="w-full md:w-32 h-32 object-cover rounded-xl border" 
                    />
                  </div>
                  
                  <div className="flex-1">
                    {/* Clickable Product Name */}
                    <h2 
                      onClick={() => navigate(`/product/${product?._id}`)} 
                      className="text-xl font-bold text-gray-900 leading-snug cursor-pointer transition-colors"
                    >
                      {product?.name}
                    </h2>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Qty: {order.qty}</span>
                      {orderedProduct.colorOption && <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Color: {orderedProduct.colorOption}</span>}
                    </div>
                    <p className="mt-4 text-sm font-medium text-blue-600">Seller: {order.shop?.businessName || "Official Store"}</p>
                  </div>
                </div>
              </div>

              {/* Status Tracker */}
<div className="p-8 bg-gray-50 border-t">
  <div className="relative flex justify-between max-w-2xl mx-auto">
    {/* Background Line */}
    <div className="absolute top-5 w-full h-0.5 bg-gray-200"></div>
    
    {/* Progress Line */}
    <div 
      className="absolute top-5 h-0.5 bg-blue-600 transition-all duration-700" 
      style={{ width: `${(safeCurrentIndex / 2) * 100}%` }}
    ></div>

    {statusSteps.map((step, idx) => {
      const active = idx <= safeCurrentIndex;
      
      // LOGIC TO GET DATE AND TIME:
      // Find the history entry that matches this specific step key
      const historyEntry = order.statusHistory?.find(h => h.status === step.key);
      
      // Format the date if the entry exists
      const formattedDate = historyEntry 
        ? new Date(historyEntry.updatedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        : "";

      const formattedTime = historyEntry
        ? new Date(historyEntry.updatedAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }).toLowerCase()
        : "";

      return (
        <div key={idx} className="relative z-10 flex flex-col items-center">
          {/* Icon Circle */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-500 ${active ? step.color + " text-white" : "bg-white text-gray-300"}`}>
            {step.icon}
          </div>
          
          {/* Status Name */}
          <span className={`text-[11px] font-bold mt-2 uppercase tracking-tight ${active ? 'text-gray-900' : 'text-gray-400'}`}>
            {step.key}
          </span>

          {/* Date and Time Display (Matching your image) */}
          {historyEntry && (
            <div className="text-center mt-1">
              <p className="text-[9px] text-gray-500 font-medium leading-none">
                {formattedDate}, {formattedTime}
              </p>
            </div>
          )}
        </div>
      );
    })}
  </div>
</div>
            </div>

            {order.status === "Delivered" && (
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Rate your purchase</h3>
                <StarRating rating={reviewData.rating} onRatingChange={(r) => setReviewData(p => ({ ...p, rating: r }))} />
                <textarea value={reviewData.comment} onChange={(e) => setReviewData(p => ({ ...p, comment: e.target.value }))} className="w-full mt-4 p-4 border rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none" rows={3} placeholder="How is the product quality?" />
                <button onClick={handleSubmitReview} className="mt-4 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 shadow-md">Submit Review</button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Delivery Address</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <FaUser className="mt-1 text-blue-500" />
                  <div>
                    <p className="font-bold text-gray-900">{order.shippingAddress?.reciever_name}</p>
                    <p className="text-gray-500 text-xs">{order.shippingAddress?.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm pt-2 border-t mt-2">
                  <FaHome className="mt-1 text-gray-400" />
                  <p className="text-gray-600 leading-relaxed text-xs">
                    {order.shippingAddress?.instituteAddress1}, {order.shippingAddress?.district}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Price Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Product Price</span>
                  <span className="line-through">₹{orderedProduct.originalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-800">
                  <span>Discounted price</span>
                  <span>₹{unitPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-800">
                  <span>Quantity</span>
                  <span className="font-bold">{qty}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Tax (GST)</span>
                  <span>₹{gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t mt-4">
                  <span>Total price</span>
                  <span>₹{order.totalPrice.toLocaleString()}</span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border">
                    <span className="text-xs text-gray-500 font-bold uppercase">Paid by</span>
                    <span className="text-xs font-bold px-3 py-1 bg-white border rounded-lg shadow-xs">{order.paymentInfo?.method || "Manual"}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Payment Status</span>
                      <span className="font-bold text-gray-800">{displayPaymentStatus}</span>
                    </div>
                    {/* <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="text-gray-800 font-mono text-[10px]">{order.paymentInfo?.transactionId || "NA"}</span>
                    </div> */}
                  </div>
                </div>

                <button disabled={isDownloading} onClick={() => handleDownloadInvoice(order._id)} className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-blue-100 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50">
                  {isDownloading ? <FiLoader className="animate-spin" /> : <FiDownload className="text-lg" />}
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;