import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import { useUserStore } from "@/store/userStore";
import OrderBreadcrumb from "../ui/OrderBredcrum"; 
import { FiDownload, FiLoader } from "react-icons/fi";
import { FaUser, FaPhoneAlt, FaHome } from "react-icons/fa";
import { API_URL, BASE_URL } from "@/data";
import PaymentViewDialog from "../ui/PaymentViewDialog";
import { toast } from "react-toastify";
import StarRating from "../Order/StarRating";


interface Product {
  _id: string;
  name: string;
  images?: string[];
  manufacturerName?: string;
  tags?: string[];
}

interface Variant {
  _id: string;
  colorOption?: string;
  size?: string;
  originalPrice: number;
  discountPrice: number;
  productId?: Product;
  thumbnail?: string;
}

interface Order {
  _id: string;
  variant?: Variant;
  qty: number;
  totalPrice: number;
  status: string;
  createdAt?: string;
  deliveredAt?: string;
  paymentFile?: string;
  shippingAddress?: {
    state: string;
    district: string;
    instituteAddress1: string;
    instituteAddress2?: string;
    pincode: string;
    landmark?: string;
    reciever_name: string;
    phone: string;
  };
  paymentInfo?: {
    method?: string;
    status?: string;
    transactionId?: string;
  };
  paymentAttempts?: {
    attemptedAt?: string;
    status?: string;
    paymentId?: string;
    message?: string;
  }[];
  shop?: {
    businessName?: string;
  };
  paidAt?: string;
  statusHistory?: {
    _id: string;
    status: string;
    updatedAt: string;
  }[];
  trackingDetails?: {
    trackingNumber?: string;
    logisticPartner?: string;
    pickupPerson?: string;
    pickupPersonPhone?: string;
    trackingDocument?: string;
    deliveredAt?: string;
  };
  invoicePdf?:string;
  review?: {
    _id: string;
    rating: number;
    comment: string;
    images?: string[];
  } | null; 
}
interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}


const OrderSummary = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useUserStore((state) => state);

  const [order, setOrder] = useState<Order | null>(null);
  const [orderedProduct, setOrderedProduct] = useState<Variant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const canRateProduct = order?.status === "Delivered";

const [reviewData, setReviewData] = useState<{
  _id?: string;
  rating: number;
  comment: string;
  images: (File | string)[];
}>({
  rating: 0,
  comment: "",
  images: [],
});


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




  useEffect(() => {
    const fetchReviews = async () => {
      if (!order?._id) return;
      try {
        setReviewsLoading(true);
        const res = await fetch(`${API_URL}user/getReviews/${order._id}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [order?._id]);


 const handleSubmitReview = async () => {
  if (!reviewData.rating) {
    toast.error("Please select a rating");
    return;
  }

  if (!product?._id || !order?._id || !user?._id) return;

  const formData = new FormData();
  formData.append("user", user._id);
  formData.append("productId", product._id);
  formData.append("orderId", order._id);
  formData.append("rating", reviewData.rating.toString());
  formData.append("comment", reviewData.comment);

  reviewData.images.forEach((file) => {
    if (file instanceof File) formData.append("images", file);
  });

  try {
    let res;
    if (reviewData._id) {
      res = await fetch(`${API_URL}user/updateReview/${reviewData._id}`, {
        method: "PUT",
        body: formData,
      });
    } else {
      res = await fetch(`${API_URL}user/addReview`, {
        method: "POST",
        body: formData,
      });
    }

    const data = await res.json();

    if (data.success) {
      toast.success(reviewData._id ? "Review updated!" : "Review submitted!");

      // Update reviewData
      setReviewData({
        _id: data.review._id,
        rating: data.review.rating,
        comment: data.review.comment,
        images: data.review.images || [],
      });

      // Update order.review for real-time display
      setOrder((prev) => prev ? { ...prev, review: data.review } : prev);

      // Update reviews list if you display multiple reviews
      setReviews((prev) => {
        const index = prev.findIndex((r) => r._id === data.review._id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data.review;
          return updated;
        }
        return [data.review, ...prev];
      });
    } else {
      toast.error(data.message || "Something went wrong");
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to submit review");
  }
};



  const normalizeImage = (src?: string | null): string => {
    if (!src) return "/placeholder.png";
    if (/^(https?:\/\/|\/)/.test(src)) return src;
    if (src.startsWith("uploads/")) return `/${src}`;
    return `/images/${src}`;
  };

  useEffect(() => {
    const fetchOrderForProduct = async () => {
      if (!user?._id || !productId) return;

      try {
        const res = await fetch(`${API_URL}order/get-all-orders/${user._id}`);
        const data = await res.json();

        if (!data.success) throw new Error("Failed to fetch orders");

        const foundOrder =
          data.orders.find((o: Order) => o._id === productId) ||
          data.orders.find((o: Order) => o.variant?.productId?._id === productId);

        if (!foundOrder) {
          setError("No order found for this product");
          return;
        }

        setOrder(foundOrder);
        setOrderedProduct(foundOrder.variant!);
        setProduct(foundOrder.variant?.productId || null);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }
    };

    fetchOrderForProduct();
  }, [user?._id, productId]);

  const handleDownloadInvoice = async (orderId: string | undefined, ) => {
    if (order?.status !== "Delivered") {
      toast.error("Invoice can only be downloaded once the order is delivered.");
      return;
    }
  
    if (!orderId) return;
  
    try {
      setIsDownloading(true); // start spinner
      const res = await fetch(`${API_URL}order/invoice/${orderId}`, {
        method: "GET",
      });
  
      if (!res.ok) {
        throw new Error("Failed to fetch invoice");
      }
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); // free memory
    } catch (err) {
      console.error("Invoice download failed:", err);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setIsDownloading(false); // stop spinner
    }
  };

  if (error)
    return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!order || !orderedProduct || !product)
    return <div className="p-10 text-center">Loading order details...</div>;

  const imageUrl = normalizeImage(
    orderedProduct.thumbnail ?? product.images?.[0] ?? "/placeholder.png"
  );

  const totalAmount = orderedProduct.discountPrice * order.qty;
  const gstAmount = Math.max(0, order.totalPrice - totalAmount);
  const gstPercent = totalAmount > 0 ? (gstAmount / totalAmount) * 100 : 0;

  const shippingAddress = order.shippingAddress;
  const trackingDetails = order.trackingDetails;
  const paymentMethod = (order.paymentInfo?.method || "").toLowerCase();
  const isOnlinePayment = ["hdfc", "online", "razorpay"].includes(paymentMethod);
  const displayPaymentStatus =
    order.paymentInfo?.status === "Pending" &&
    ["Processing", "Packed", "Shipped", "Delivered"].includes(order.status)
      ? "Paid"
      : (order.paymentInfo?.status || "Pending");

  // Improved Timeline
   const statusSteps = [
    { key: "Packed", color: "bg-blue-500", icon: "📦" },
    { key: "Shipped", color: "bg-orange-500", icon: "🚚" },
    { key: "Delivered", color: "bg-green-500", icon: "✅" },
  ];

  // Determine which step is active
  const currentIndex = statusSteps.findIndex((s) => s.key === order?.status);
  // Will be -1 if order status is not Packed/Shipped/Delivered
  const safeCurrentIndex = currentIndex; 

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <OrderBreadcrumb orderId={order._id} />

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {/* ---------------- LEFT SECTION ---------------- */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            {/* Product Header */}
            <div className="flex items-start justify-between border-b pb-6">
              <div className="flex gap-4">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-24 h-24 rounded-xl border object-cover shadow-sm"
                />
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{product.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {orderedProduct.colorOption && `Color: ${orderedProduct.colorOption}`}{" "}
                    {orderedProduct.size && `| Size: ${orderedProduct.size}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Seller:{" "}
                    <span className="font-medium text-gray-700">
                      {order?.shop?.businessName || "Unknown Seller"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">
                  ₹{orderedProduct.discountPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">Qty: {order.qty}</p>
                <div className="mt-2">
                  {!isOnlinePayment && (
                    <PaymentViewDialog paymentData={order.paymentFile ?? null} />
                  )}
                </div>
                
              </div>
            </div>

            {/* Improved Order Timeline */}
             <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-4">Order Status</h3>
              <div className="relative flex justify-between items-center">
                {/* Base line (gray) */}
                <div className="absolute top-3 left-0 w-full h-1 bg-gray-200 z-0"></div>

                {/* Dynamic blue line - only show if status is Packed or later */}
                {safeCurrentIndex >= 0 && (
                  <div
                    className="absolute top-3 left-0 h-1 bg-blue-500 z-10 transition-all duration-500"
                    style={{
                      width: `${((safeCurrentIndex + 1) / statusSteps.length) * 100}%`,
                    }}
                  ></div>
                )}

                {statusSteps.map((step, index) => {
                  const isActive = index <= safeCurrentIndex;
                  const stepHistory = order.statusHistory?.find(
                    (s) => s.status === step.key
                  );

                  return (
                    <div
                      key={step.key}
                      className="relative flex flex-col items-center z-20"
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-white transition-all duration-300
                          ${isActive ? step.color : "bg-gray-200"}`}
                      >
                        <span>{step.icon}</span>
                      </div>
                      <span
                        className={`mt-2 text-xs font-semibold ${
                          isActive ? "text-black" : "text-gray-400"
                        }`}
                      >
                        {step.key}
                      </span>
                      {stepHistory && (
                        <span className="text-[10px] text-gray-500 mt-1 text-center">
                          {(() => {
                            const date = new Date(stepHistory.updatedAt);
                            return isNaN(date.getTime())
                              ? "N/A"
                              : date.toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                });
                          })()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {canRateProduct ? (
              <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-5">
                <h3 className="text-md font-semibold text-gray-800 mb-4">
                  {order.review ? "Your Review" : "Rate this product"}
                </h3>

                {/* ---------- Review Form ---------- */}
                <div className="space-y-3">
                  {/* Rating */}
                  <StarRating
                    rating={reviewData.rating}
                    onRatingChange={(r) =>
                      setReviewData((prev) => ({ ...prev, rating: r }))
                    }
                  />

                  {/* Comment */}
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) =>
                      setReviewData((prev) => ({ ...prev, comment: e.target.value }))
                    }
                    placeholder="Write your review..."
                    className="w-full mt-2 border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  {/* Image Upload */}
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files).filter((file) =>
                        file.type.startsWith("image/")
                      );
                      setReviewData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative border-2 border-dashed border-gray-300 p-4 text-center rounded cursor-pointer"
                  >
                    Drag & drop images here, or click to select
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setReviewData((prev) => ({
                          ...prev,
                          images: [...prev.images, ...Array.from(e.target.files || [])],
                        }))
                      }
                      className="absolute w-full h-full top-0 left-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Preview Uploaded Images */}
                  {reviewData.images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {reviewData.images.map((file, idx) => {
                        const url = file instanceof File ? URL.createObjectURL(file) : normalizeImage(file);
                        return (
                          <div key={idx} className="relative">
                            <img src={url} alt={`preview-${idx}`} className="w-16 h-16 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() =>
                                setReviewData((prev) => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== idx),
                                }))
                              }
                              className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Submit / Update */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleSubmitReview}
                      className="px-4 py-2 bg-[#1C647C] text-white rounded hover:bg-[#217b9a] transition cursor-pointer"
                    >
                      {reviewData._id ? "Update Review" : "Submit Review"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-5 text-gray-500 text-sm">
                You can rate this product once your order is delivered.
              </div>
            )}


            {trackingDetails && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-700 space-y-2">
                <h4 className="font-semibold text-gray-800 mb-2">Tracking Details</h4>
                <div className="flex justify-between">
                  <span className="font-medium">Logistic Partner:</span>
                  <span className="text-gray-900 capitalize">{trackingDetails.logisticPartner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pickup Person:</span>
                  <span className="text-gray-900">{trackingDetails.pickupPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pickup Phone:</span>
                  <span className="text-gray-900">{trackingDetails.pickupPersonPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tracking Number:</span>
                  <span className="text-blue-600 font-semibold">{trackingDetails.trackingNumber}</span>
                </div>
                {trackingDetails?.trackingDocument && (
                  <div className="flex justify-between">
                    <span className="font-medium">Tracking Document:</span>
                    <button
                        onClick={() => {
                          const doc = trackingDetails.trackingDocument;
                          if (!doc) return; // exit if undefined

                          const url = `${BASE_URL}payment-docs/${doc}`;

                          fetch(url)
                            .then((response) => {
                              if (!response.ok) throw new Error("Network response was not ok");
                              return response.blob();
                            })
                            .then((blob) => {
                              const blobUrl = window.URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = blobUrl;
                              link.download = doc; // guaranteed string now
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(blobUrl);
                            })
                            .catch((err) => console.error("Download failed:", err));
                        }}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 font-medium rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm"
                      >
                        Download Document
                      </button>


                  </div>
                )}
              </div>
            )}
          </div>

          {/* ---------------- RIGHT SECTION ---------------- */}
          <div className="space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">Delivery Details</h3>
              {shippingAddress ? (
                <div className="bg-gray-50 p-3 rounded-lg space-y-3 text-sm text-gray-700 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-600" />
                    <span><strong>{shippingAddress.reciever_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt className="text-gray-600" />
                    <span>{shippingAddress.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaHome className="text-gray-600" />
                    <span>
                      {shippingAddress.instituteAddress1}, {shippingAddress.district}, {shippingAddress.state} - {shippingAddress.pincode}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Shipping address not available</p>
              )}
            </div>

            {/* Price Details */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Price Details</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Product Price</span>
                  <span className="line-through text-gray-400">₹{orderedProduct.originalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Discounted price</span>
                  <span>₹{orderedProduct.discountPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Quantity</span>
                  <span>{order.qty}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({gstPercent.toFixed(2)}%)</span>
                  <span>₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total price</span>
                  <span>₹{order.totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Paid by</span>
                <div className="flex items-center gap-1 text-xs font-semibold border rounded-md px-2 py-1 bg-white">
                  <span>{order.paymentInfo?.method || "Manual"}</span>
                </div>
              </div>
              <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <span className="font-semibold">{displayPaymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID</span>
                  <span className="font-semibold text-right break-all max-w-[60%]">
                    {order.paymentInfo?.transactionId || "NA"}
                  </span>
                </div>
              </div>

              {order.paymentAttempts && order.paymentAttempts.length > 0 && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  <h4 className="font-semibold mb-2">Payment Attempts</h4>
                  <div className="space-y-2 max-h-36 overflow-auto">
                    {order.paymentAttempts
                      .slice()
                      .reverse()
                      .map((attempt, idx) => (
                        <div key={idx} className="border rounded p-2 bg-white">
                          <p>Status: <strong>{attempt.status || "NA"}</strong></p>
                          <p>
                            Txn ID:{" "}
                            <strong className="break-all inline-block align-top">
                              {attempt.paymentId || "NA"}
                            </strong>
                          </p>
                          <p>At: <strong>{attempt.attemptedAt ? new Date(attempt.attemptedAt).toLocaleString() : "NA"}</strong></p>
                          <p>Message: <strong>{attempt.message || "NA"}</strong></p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Download Invoice */}
              <button
                type="button"
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2
                  text-gray-700 font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700
                  transition-all duration-200 shadow-sm cursor-pointer"
                onClick={() => handleDownloadInvoice(order._id)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <FiLoader className="animate-spin text-blue-600" size={18} />
                ) : (
                  <FiDownload className="text-blue-600" size={18} />
                )}
                {isDownloading ? "Downloading..." : "Download Invoice"}
              </button>

            </div>
          </div>
        </div>
      </div>
      </div>
  );
};

export default OrderSummary;


