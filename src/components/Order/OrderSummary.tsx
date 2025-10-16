import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import { useUserStore } from "@/store/userStore";
import OrderBreadcrum from "../ui/OrderBredcrum";

// React Icons
import { FaUser, FaPhoneAlt, FaHome, FaBoxOpen, FaCheckCircle, FaStar } from "react-icons/fa";

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
  returnValidTill?: string;
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
  };
  paidAt?: string;
}

const OrderSummary = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useUserStore((state) => state);

  const [order, setOrder] = useState<Order | null>(null);
  const [orderedProduct, setOrderedProduct] = useState<Variant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Helper function to normalize image paths
  const normalizeImage = (src?: string | null): string => {
    if (!src) return "/placeholder.png";

    if (
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/")
    ) {
      return src;
    }

    if (src.startsWith("uploads/")) {
      return `/${src}`;
    }

    return `/images/${src}`;
  };

  useEffect(() => {
    const fetchOrderForProduct = async () => {
      if (!user?._id || !productId) return;

      try {
        const res = await fetch(`/api/v2/order/get-all-orders/${user._id}`);
        const data = await res.json();

        if (!data.success) throw new Error("Failed to fetch orders");

        const foundOrder = data.orders.find(
          (o: Order) => o.variant?.productId?._id === productId
        );

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

  if (error)
    return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!order || !orderedProduct || !product)
    return <div className="p-10 text-center">Loading order details...</div>;

  // ✅ Use the normalizeImage helper
  const imageUrl = normalizeImage(
    orderedProduct.thumbnail ??
      product.images?.[0] ??
      "/placeholder.png"
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <OrderBreadcrum orderId={order._id} />

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
                  <h2 className="text-sm font-semibold text-gray-900">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {orderedProduct.colorOption &&
                      `Color: ${orderedProduct.colorOption}`}{" "}
                    {orderedProduct.size && `| Size: ${orderedProduct.size}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Seller:{" "}
                    <span className="font-medium text-gray-700">
                      {product.manufacturerName || "Unknown Seller"}
                    </span>
                  </p>

                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">
                  ₹{orderedProduct.discountPrice.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500">Qty: {order.qty}</p>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="mt-8 relative">
              <h3 className="font-semibold text-gray-800 mb-3">
                Order Progress
              </h3>

              <div className="relative ml-5">
                {/* Vertical line behind icons */}
                <div className="absolute left-3 top-2 bottom-2 border-l-2 border-green-400 z-0"></div>

                {/* Order Confirmed */}
                <div className="relative flex items-start gap-3 mb-6 z-10">
                  <div className="relative">
                    <FaBoxOpen className="text-green-500 mt-1.5 text-lg bg-white rounded-full z-10 relative" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Order Confirmed
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt || "").toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Delivered */}
                <div className="relative flex items-start gap-3 z-10">
                  <div className="relative">
                    <FaCheckCircle className="text-green-500 mt-1.5 text-lg bg-white rounded-full z-10 relative" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Delivered
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.deliveredAt
                        ? new Date(order.deliveredAt).toLocaleDateString()
                        : "Pending"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Return Policy */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Return policy valid till:</span>{" "}
                  {order.returnValidTill
                    ? new Date(order.returnValidTill).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 border-t pt-5">
              <button className="border border-gray-300 text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-100 transition">
                Return
              </button>
              <button className="flex items-center gap-2 border border-yellow-400 text-yellow-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-yellow-50 transition">
                <FaStar className="text-yellow-500" />
                Rate Product
              </button>
            </div>
          </div>

          {/* ---------------- RIGHT SECTION ---------------- */}
          <div className="space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                Delivery Details
              </h3>
              {order.shippingAddress ? (
                <div className="bg-gray-50 p-3 rounded-lg space-y-3 text-sm text-gray-700 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-600" />
                    <span>
                      <strong>{order.shippingAddress.reciever_name}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt className="text-gray-600" />
                    <span>{order.shippingAddress.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaHome className="text-gray-600" />
                    <span>
                      {order.shippingAddress.instituteAddress1},{" "}
                      {order.shippingAddress.district},{" "}
                      {order.shippingAddress.state} -{" "}
                      {order.shippingAddress.pincode}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Shipping address not available
                </p>
              )}
            </div>

            {/* Price Details */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
              <h3 className="text-md font-semibold text-gray-800 mb-3">
                Price Details
              </h3>

              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Listing price</span>
                  <span className="line-through text-gray-400">
                    ₹{orderedProduct.originalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Special price</span>
                  <span>
                    ₹{orderedProduct.discountPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total amount</span>
                  <span>
                    ₹
                    {(orderedProduct.discountPrice * order.qty).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Paid by</span>
                <div className="flex items-center gap-1 text-xs font-semibold border rounded-md px-2 py-1 bg-white">
                  <span>{order.paymentInfo?.method || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
