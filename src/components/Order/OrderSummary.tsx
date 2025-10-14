import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import { Product, Order } from "../../Types/types";
import { useUserStore } from "@/store/userStore";

const OrderSummary = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useUserStore((state) => state);

  const [product, setProduct] = useState<Product | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("my product id:", productId);
      if (!productId || !user?._id) return;

      try {
        // Fetch order
        const orderRes = await fetch(`/api/v2/order/get-order/${user._id}`);
        if (!orderRes.ok) {
          throw new Error(`Failed to fetch order data: ${orderRes.statusText}`);
        }

        const orderData = await orderRes.json();

        if (!orderData || !orderData.orders || orderData.orders.length === 0) {
          setError("No order found for this user");
          return;
        }

        setOrder(orderData.orders[0]); // Use first order

        // Fetch product
        const productRes = await fetch(
          `/api/v2/product/get-product/${productId}`,
        );
        if (!productRes.ok) {
          throw new Error(
            `Failed to fetch product data: ${productRes.statusText}`,
          );
        }

        const productData = await productRes.json();

        if (!productData || !productData._id) {
          setError("Invalid product data received");
          return;
        }

        setProduct(productData);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch order or product data");
      }
    };

    fetchData();
  }, [productId, user?._id]);

  const downloadInvoice = async () => {
    if (!order?._id || !productId) return;

    try {
      const res = await fetch(
        `/api/v2/order/invoice/${order._id}/${productId}`,
      );
      if (!res.ok) throw new Error("Failed to download invoice");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order._id}-${productId}.pdf`;

      document.body.appendChild(link); // Append to DOM for Firefox, Safari
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error downloading invoice");
    }
  };

  if (error) {
    return <div className="p-10 text-center text-red-600">{error}</div>;
  }

  if (!product || !order) {
    return <div className="p-10 text-center">Loading details...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
          {/* Left Section */}
          <div className="flex-1 space-y-6">
            {/* Product Card */}
            <div className="flex items-start gap-4 border-b pb-4">
              <img
                src={
                  product.images && product.images.length > 0
                    ? `BASE_URL/uploads/${product.images[0]}`
                    : "/placeholder.png"
                }
                alt={product.name || "Product"}
                className="w-24 h-24 object-contain border rounded-md"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Sold by:{" "}
                  {typeof product.manufacturer !== "string"
                    ? product.manufacturer.manufacturerName
                    : "Unknown Seller"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-xl font-bold text-green-700">
                    ₹{order.totalPrice}
                  </p>
                  <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                    {product.tags?.join(", ") || "No offers"}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="mt-6">
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
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                Payment Information
              </h3>
              {order.paymentInfo ? (
                <>
                  <p>
                    Payment Type:{" "}
                    <span className="font-medium">
                      {order.paymentInfo.method}
                    </span>
                  </p>
                  <p>
                    Payment Status:{" "}
                    <span className="font-medium">
                      {order.paymentInfo.status}
                    </span>
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
                    <span className="font-medium">State:</span>{" "}
                    {order.shippingAddress.state}
                  </p>
                  <p>
                    <span className="font-medium">District:</span>{" "}
                    {order.shippingAddress.district}
                  </p>
                  <p>
                    <span className="font-medium">Address 1:</span>{" "}
                    {order.shippingAddress.instituteAddress1}
                  </p>
                  <p>
                    <span className="font-medium">Address 2:</span>{" "}
                    {order.shippingAddress.instituteAddress2}
                  </p>
                  <p>
                    <span className="font-medium">Pincode:</span>{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  <p>
                    <span className="font-medium">Landmark:</span>{" "}
                    {order.shippingAddress.landmark}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Shipping address not available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
