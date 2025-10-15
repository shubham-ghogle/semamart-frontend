import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import { useUserStore } from "@/store/userStore";
import OrderBreadcrum from "../ui/OrderBredcrum";

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
  discountPrice : number;
  productId?: Product;
  thumbnail?:string;
}

interface Order {
  _id: string;
  variant?: Variant;
  qty: number;
  totalPrice: number;
  status: string;
  deliveredAt?: string;
  shippingAddress?: {
    state: string;
    district: string;
    instituteAddress1: string;
    instituteAddress2?: string;
    pincode: string;
    landmark?: string;
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

  // Fetch current user's order for this product
  useEffect(() => {
    const fetchOrderForProduct = async () => {
      if (!user?._id || !productId) return;

      try {
        const res = await fetch(`/api/v2/order/get-all-orders/${user._id}`);
        const data = await res.json();

        if (!data.success) throw new Error("Failed to fetch orders");

        // Find order containing this product
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

  // Download invoice
  const downloadInvoice = async () => {
    if (!order?._id) return;

    try {
      const res = await fetch(`/api/v2/order/invoice/${order._id}`);
      if (!res.ok) throw new Error("Failed to download invoice");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error downloading invoice");
    }
  };

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!order || !orderedProduct || !product)
    return <div className="p-10 text-center">Loading order details...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
          <OrderBreadcrum orderId={order?._id} />
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
          {/* Left Section */}
          <div className="flex-1 space-y-6">
            {/* Product Info */}
            <div className="flex items-start gap-4 border-b pb-4">
              <img
                    src={
                      orderedProduct.thumbnail
                        ? `/uploads/${orderedProduct.thumbnail}`
                        : product.images?.length
                        ? `/uploads/${product.images[0]}`
                        : "/placeholder.png"
                    }
                    alt={product.name}
                    className="w-24 h-24 object-contain border rounded-md"
                  />

              <div>
                <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Sold by: {product.manufacturerName || "Unknown Seller"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-xl font-bold text-green-700">
                    ₹{orderedProduct.discountPrice}
                  </p>
                  <p className="text-sm text-gray-600">Quantity: {order.qty}</p>
                  <p className="text-sm text-gray-600">
                    Total: ₹{ orderedProduct.discountPrice* order.qty}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Status</h3>
              <p className="text-gray-700 font-medium">{order.status}</p>
              <p className="text-sm text-gray-500">
                Delivered At:{" "}
                {order.deliveredAt
                  ? new Date(order.deliveredAt).toLocaleString()
                  : "Not delivered yet"}
              </p>
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
              {order.paymentInfo ? (
                <>
                  <p>
                    Payment Type:{" "}
                    <span className="font-medium">{order.paymentInfo.method}</span>
                  </p>
                  <p>
                    Payment Status:{" "}
                    <span className="font-medium">{order.paymentInfo.status}</span>
                  </p>
                  <p>
                    Paid At:{" "}
                    <span className="font-medium">
                      {order.paidAt
                        ? new Date(order.paidAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </p>
                </>
              ) : (
                <p>Payment info not available</p>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="w-full md:max-w-sm space-y-6">
            <button
              onClick={downloadInvoice}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Download Invoice
            </button>

            {/* Delivery Info */}
            <div>
              <h4 className="text-md font-semibold mb-2">Delivery Details</h4>
              {order.shippingAddress ? (
                <div className="bg-gray-50 p-4 rounded-md text-sm space-y-1">
                  <p>
                    <span className="font-medium">State:</span> {order.shippingAddress.state}
                  </p>
                  <p>
                    <span className="font-medium">District:</span>{" "}
                    {order.shippingAddress.district}
                  </p>
                  <p>
                    <span className="font-medium">Address 1:</span>{" "}
                    {order.shippingAddress.instituteAddress1}
                  </p>
                  {order.shippingAddress.instituteAddress2 && (
                    <p>
                      <span className="font-medium">Address 2:</span>{" "}
                      {order.shippingAddress.instituteAddress2}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Pincode:</span>{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  {order.shippingAddress.landmark && (
                    <p>
                      <span className="font-medium">Landmark:</span>{" "}
                      {order.shippingAddress.landmark}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Shipping address not available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
