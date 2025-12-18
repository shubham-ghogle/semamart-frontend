import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminMainWrapper from "../Admin/AdminMainWrapper";
import { FiDownload } from "react-icons/fi";
import { FaUser, FaPhoneAlt, FaHome } from "react-icons/fa";

/* ================= TYPES ================= */
type Status = "pending" | "success" | "error";

interface Product {
  _id: string;
  name: string;
  images?: string[];
  manufacturerName?: string;
}

interface Variant {
  _id: string;
  colorOption?: string;
  size?: string;
  originalPrice: number;
  discountPrice: number;
  thumbnail?: string;
  productId?: Product;
}

interface Order {
  _id: string;
  variant?: Variant;
  qty: number;
  status: "Placed" | "Shipped" | "Out for Delivery" | "Delivered";
  createdAt?: string;
  deliveredAt?: string;
  returnValidTill?: string;
  shippingAddress?: {
    reciever_name: string;
    phone: string;
    instituteAddress1: string;
    district: string;
    state: string;
    pincode: string;
  };
  paymentInfo?: {
    method?: string;
  };
}

/* ================= COMPONENT ================= */
const adminOrderSummary = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const [status, setStatus] = useState<Status>("pending");
  const [error, setError] = useState<string>();

  const [order, setOrder] = useState<Order | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  /* ================= IMAGE HELPER ================= */
  const normalizeImage = (src?: string | null) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("http") || src.startsWith("/")) return src;
    if (src.startsWith("uploads/")) return `/${src}`;
    return `/images/${src}`;
  };

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        setStatus("pending");

        const res = await fetch(`/api/v2/order/get-order/${orderId}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch order");
        }

        const fetchedOrder: Order = data.order;

        setOrder(fetchedOrder);
        setVariant(fetchedOrder.variant ?? null);
        setProduct(fetchedOrder.variant?.productId ?? null);

        setStatus("success");
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setStatus("error");
      }
    };

    fetchOrder();
  }, [orderId]);

  /* ================= IMAGE ================= */
  const imageUrl = normalizeImage(
    product?.images?.[0] ?? variant?.thumbnail
  );

  /* ================= RENDER ================= */
  return (
    <AdminMainWrapper
      heading="Order Summary"
      status={status}
      errorMeassage={error}
    >
      {order && variant && product && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* ================= LEFT ================= */}
          <div className="md:col-span-2 bg-white rounded-xl border p-5">
        

            {/* PRODUCT INFO */}
            <div className="flex justify-between gap-4 border-b pb-4 mt-4">
              <div className="flex gap-4">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-24 h-24 rounded-lg border object-cover"
                />
                <div>
                  <h2 className="font-semibold">{product.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {variant.colorOption && `Color: ${variant.colorOption}`}{" "}
                    {variant.size && `| Size: ${variant.size}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Seller:{" "}
                    <span className="font-medium">
                      {product.manufacturerName || "Unknown"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-lg">
                  ₹{variant.discountPrice.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500">Qty: {order.qty}</p>
              </div>
            </div>

            {/* ORDER PROGRESS */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Order Progress</h3>

              <div className="relative flex justify-between">
                <div className="absolute top-[10px] w-full h-[2px] bg-blue-200"></div>

                {["Placed", "Shipped", "Out for Delivery", "Delivered"].map(
                  (step, i) => {
                    const current =
                      ["Placed", "Shipped", "Out for Delivery", "Delivered"].indexOf(
                        order.status
                      );
                    const active = i <= current;

                    return (
                      <div
                        key={step}
                        className="relative z-10 flex flex-col items-center flex-1"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                            active
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "bg-white border-blue-200 text-blue-300"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <span className="text-xs mt-2 font-semibold">
                          {step}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* RETURN POLICY */}
            {/* <div className="mt-6 bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
              Return valid till:{" "}
              <strong>
                {order.returnValidTill
                  ? new Date(order.returnValidTill).toLocaleDateString()
                  : "N/A"}
              </strong>
            </div> */}

            {/* ACTIONS */}
            {/* <div className="flex justify-between mt-6 border-t pt-4">
              <button className="border px-4 py-2 rounded-lg text-sm">
                Return
              </button>
              <button className="flex items-center gap-2 border border-yellow-400 text-yellow-600 px-4 py-2 rounded-lg">
                <FaStar /> Rate Product
              </button>
            </div> */}
          </div>

          {/* ================= RIGHT ================= */}
          <div className="space-y-6">
            {/* DELIVERY */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold mb-3">Delivery Details</h3>
              {order.shippingAddress && (
                <div className="text-sm space-y-2">
                  <p className="flex gap-2">
                    <FaUser /> {order.shippingAddress.reciever_name}
                  </p>
                  <p className="flex gap-2">
                    <FaPhoneAlt /> {order.shippingAddress.phone}
                  </p>
                  <p className="flex gap-2">
                    <FaHome /> {order.shippingAddress.instituteAddress1}
                  </p>
                </div>
              )}
            </div>

            {/* PRICE */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold mb-3">Price Details</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Listing price</span>
                  <span className="line-through">
                    ₹{variant.originalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ₹
                    {(variant.discountPrice * order.qty).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              <button className="mt-4 w-full flex items-center justify-center gap-2 border rounded-lg py-2">
                <FiDownload /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminMainWrapper>
  );
};

export default adminOrderSummary;
