import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import { Product, Order, } from "../../Types/types";
import { useUserStore } from "@/store/userStore";

const OrderSummary = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useUserStore((state) => state);

  const [product, setProduct] = useState<Product | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!productId || !user?._id) return;

      try {
        console.log("my user :",user?._id);
        const orderRes = await fetch(`/api/v2/order/get-order/${user._id}`);
        const orderData = await orderRes.json();

        if (!orderData) { 
          setError("No order found for this user");
          return;
        }

         setOrder(orderData.orders[0]);

        // Fetch product by product ID
        const productRes = await fetch(`http://localhost:8000/api/v2/product/get-product/${productId}`);
        const productData = await productRes.json();

        if (!productData || !productData._id) {
          setError("Invalid product data received");
          return;
        }

        setProduct(productData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch order or product data");
      }
    };

    fetchData();
  }, [productId, user]);

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
                    ? `http://localhost:8000/uploads/${product.images[0]}`
                    : "/placeholder.png"
                }
                alt={product.name}
                className="w-24 h-24 object-contain border rounded-md"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Sold by: {product.manufacturerName || "Unknown Seller"}</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-xl font-bold text-green-700">₹{product.discountPrice}</p>
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
              <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
              {order.paymentInfo ? (
                <>
                  <p>
                    Payment Type: <span className="font-medium">{order.paymentInfo.type}</span>
                  </p>
                  <p>
                    Payment Status: <span className="font-medium">{order.paymentInfo.status}</span>
                  </p>
                  <p>
                    Paid At:{" "}
                    <span className="font-medium">
                      {order.paymentInfo.paidAt
                        ? new Date(order.paymentInfo.paidAt).toLocaleString()
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
  {/* Delivery Info */}
  <div>
    <h4 className="text-md font-semibold mb-2">Delivery Details</h4>
    {order.shippingAddress ? (
      <div className="bg-gray-50 p-4 rounded-md text-sm space-y-1">
        <p>
          <span className="font-medium">State:</span> {order.shippingAddress.state}
        </p>
        <p>
          <span className="font-medium">District:</span> {order.shippingAddress.district}
        </p>
        <p>
          <span className="font-medium">Address 1:</span> {order.shippingAddress.instituteAddress1}
        </p>
        <p>
          <span className="font-medium">Address 2:</span> {order.shippingAddress.instituteAddress2}
        </p>
        <p>
          <span className="font-medium">Pincode:</span> {order.shippingAddress.pincode}
        </p>
        <p>
          <span className="font-medium">Landmark:</span> {order.shippingAddress.landmark}
        </p>
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
