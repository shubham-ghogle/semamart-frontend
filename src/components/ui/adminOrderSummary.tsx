import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminMainWrapper from "../Admin/AdminMainWrapper";
import { FiDownload } from "react-icons/fi";
import { FaPhoneAlt, FaTruck } from "react-icons/fa";
import { API_URL } from "@/data";

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

interface ShippingAddress {
  reciever_name: string;
  phone: string;
  alternatePhone?: string;
  instituteAddress1: string;
  instituteAddress2?: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  addressType?: string;
}

interface ShippingInfo {
  courier?: string;
  trackingId?: string;
  trackingUrl?: string;
  shippedAt?: string;
  pickupPerson?: string;
  pickupPersonPhone?: string;
  deliveredAt?: string;
}

interface StatusHistory {
  status: "Created" | "Paid" | "Processing" | "Packed" | "Shipped" | "Delivered";
  updatedAt: string;
  _id: string;
}

interface TrackingDetails {
  logisticPartner?: string;
  pickupPerson?: string;
  pickupPersonPhone?: string;
  trackingNumber?: string;
  trackingDocument?: string;
  deliveredAt?: string;
}

interface Order {
  _id: string;
  variant?: Variant;
  qty: number;
  status: "Packed" | "Shipped" | "Out for Delivery" | "Delivered";
  shippingAddress?: ShippingAddress;
  shippingInfo?: ShippingInfo;
  totalPrice: number;
  tax?: number;
  paymentFile?: string;
  statusHistory?: StatusHistory[];
  trackingDetails?: TrackingDetails;
}

/* ================= COMPONENT ================= */
const AdminOrderSummary = () => {
  const { orderId } = useParams();

  const [status, setStatus] = useState<Status>("pending");
  const [error, setError] = useState<string>();
  const [order, setOrder] = useState<Order | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  /* ================= IMAGE HELPER ================= */
  const normalizeImage = (src?: string | null) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("http") || src.startsWith("/")) return src;
    return `/${src}`;
  };

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setStatus("pending");
        const res = await fetch(`${API_URL}order/get-order/${orderId}`);
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        setOrder(data.order);
        setVariant(data.order.variant);
        setProduct(data.order.variant?.productId);
        setStatus("success");
      } catch (err: any) {
        setError(err.message || "Failed to load order");
        setStatus("error");
      }
    };

    fetchOrder();
  }, [orderId]);

  const imageUrl = normalizeImage(product?.images?.[0] ?? variant?.thumbnail);

  /* ================= TIMELINE STEPS ================= */
  const getStatusDate = (step: string) => {
    if (!order) return null;

    // Check in statusHistory
    const historyItem = order.statusHistory?.find((s) => s.status === step);
    if (historyItem) return new Date(historyItem.updatedAt);

    // Out for Delivery fallback if tracking exists
    if (step === "Out for Delivery" && order.trackingDetails?.trackingNumber) {
      const shipped = order.statusHistory?.find((s) => s.status === "Shipped");
      return shipped ? new Date(shipped.updatedAt) : null;
    }

    // Delivered fallback
    if (step === "Delivered" && order.trackingDetails?.deliveredAt) {
      return new Date(order.trackingDetails.deliveredAt);
    }

    return null;
  };

  let steps: string[] = ["Packed", "Shipped"];
  if (order?.trackingDetails?.trackingNumber) steps.push("Out for Delivery");
  steps.push("Delivered");

  const currentStep = order ? steps.findIndex((s) => s === order.status) : 0;

  const showShippingDetails =
    order && ["Shipped", "Out for Delivery", "Delivered"].includes(order.status);

  /* ================= RENDER ================= */
  return (
    <AdminMainWrapper heading="Order Summary" status={status}>
      {order && variant && product ? (
        <div className="grid md:grid-cols-3 gap-6">
          {/* ================= LEFT ================= */}
          <div className="md:col-span-2 bg-white rounded-xl border p-5">
            {/* PRODUCT INFO */}
            <div className="flex justify-between gap-4 border-b pb-4">
              <div className="flex gap-4">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-24 h-24 rounded-lg border object-cover"
                />
                <div>
                  <h2 className="font-semibold truncate">
                      {product.name.split(" ").slice(0, 8).join(" ")}
                      {product.name.split(" ").length > 8 && "..."}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {variant.colorOption && `Color: ${variant.colorOption} `}
                    {variant.size && `| Size: ${variant.size}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Seller: {product.manufacturerName || "Unknown"}
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

            {/* ORDER STATUS TIMELINE */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Order Status</h3>

              <div className="relative flex justify-between items-center">
                {/* Background line */}
                <div className="absolute top-3 w-full h-[2px] bg-gray-200 z-0"></div>
                {/* Filled progress */}
                <div
                  className="absolute top-3 h-[2px] bg-blue-500 z-10 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />

                {/* Step circles */}
                {steps.map((step, i) => (
                  <div key={step} className="relative z-20 flex flex-col items-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors duration-300 ${
                        i <= currentStep
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs mt-2 font-semibold text-center">{step}</span>
                    {getStatusDate(step) && (
                      <span className="text-[10px] text-gray-400 mt-1">
                        {getStatusDate(step)?.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SHIPPING + TRACKING */}
            {showShippingDetails && order.shippingAddress && (
              <div className="mt-8 bg-gray-50 border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FaTruck /> Shipping Details
                </h3>

                <p className="font-medium">{order.shippingAddress.reciever_name}</p>
                <p className="text-sm">
                  {order.shippingAddress.instituteAddress1}
                  {order.shippingAddress.instituteAddress2 &&
                    `, ${order.shippingAddress.instituteAddress2}`}
                  <br />
                  {order.shippingAddress.landmark && `Landmark: ${order.shippingAddress.landmark}`}
                  <br />
                  {order.shippingAddress.district}, {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pincode}
                </p>
                  <p className="flex items-center text-sm mt-1 gap-1">
                    <FaPhoneAlt />
                    <span>
                      {order.shippingAddress.phone}
                      {order.shippingAddress.alternatePhone &&
                        ` | Alt: ${order.shippingAddress.alternatePhone}`}
                    </span>
                  </p>


                {order.trackingDetails && (
                  <div className="mt-3 border-t pt-3 text-sm space-y-1">
                    <p>
                      <strong>Courier:</strong>{" "}
                      {order.trackingDetails.logisticPartner || "N/A"}
                    </p>
                    <p>
                      <strong>Tracking ID:</strong>{" "}
                      {order.trackingDetails.trackingNumber || "N/A"}
                    </p>
                    {order.trackingDetails.pickupPerson && (
                      <p>
                        <strong>Pickup Person:</strong>{" "}
                        {order.trackingDetails.pickupPerson}                      
                      </p>
                    )}
                     <p>
                        <strong>Call:</strong>{" "}                       
                        {order.trackingDetails.pickupPersonPhone || "N/A"}
                      </p>
                    {/* {order.trackingDetails.trackingDocument && (
                      <a
                        href={`${API_URL}files/${order.trackingDetails.trackingDocument}`}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        View Tracking Document
                      </a>
                    )} */}
                    {order.trackingDetails.deliveredAt && (
                      <p>
                        <strong>Delivered At:</strong>{" "}
                        {new Date(order.trackingDetails.deliveredAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= RIGHT ================= */}
          <div className="space-y-6">
            {/* PRICE DETAILS */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold mb-3">Price Details</h3>

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Unit Price</span>
                  <span>₹{variant.discountPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span>{order.qty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{order.tax?.toLocaleString("en-IN") || 0}%</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Price</span>
                  <span>₹{order.totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* INVOICE / PAYMENT FILE */}
              {order.paymentFile && (
                <a
                  href={`${API_URL}files/${order.paymentFile}`}
                  target="_blank"
                  className="mt-4 w-full flex items-center justify-center gap-2 border rounded-lg py-2 text-blue-600"
                >
                  <FiDownload /> Download Payment/Invoice
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          {status === "pending" ? "Loading order..." : error || "Order not found"}
        </p>
      )}
    </AdminMainWrapper>
  );
};

export default AdminOrderSummary;
