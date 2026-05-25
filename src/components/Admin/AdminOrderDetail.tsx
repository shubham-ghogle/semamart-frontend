import { Order } from "@/Types/types";
import { useState } from "react";
import { useParams } from "react-router";
import OrderDetailsField from "../Seller/OrderDetailsFields";
import { API_URL, BASE_URL } from "@/data";
import { formatDate } from "../UIComponents/Inputs";
import { useAdminOrderMutation } from "@/Screens/Admin/Admin.HooksAndUtils";
import { Button } from "../ui/button";
import OrderPaymentViewDialog from "./OrderPaymentViewDialog";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { getOrderLinePricing, getProductImage } from "@/lib/utils";
import OrderRequestPanel from "../Order/OrderRequestPanel";
import { getVisibleOrderRequest } from "@/lib/orderRequests";
import { getDisplayOrderStatus } from "@/lib/orderStatus";


type AdminOrderDetailProps = {
  data: Order;
};

export default function AdminOrderDetail({ data }: AdminOrderDetailProps) {
  const { orderId } = useParams();
  const { mutationStatus, mutateOrder } = useAdminOrderMutation();
  const [status, setStatus] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const visibleRequest = getVisibleOrderRequest(data);
  const hasActiveRequest = Boolean(visibleRequest?.isActive);
  const formatDateTime = (dateValue?: string | Date) => {
    if (!dateValue) return "NA";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "NA";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };


  const getOptionsForStatus = () => {
    switch (data.status) {
      case "Created":
      case "Paid":
        return ["Processing"];
      case "Processing":
        return ["Packed"];
      case "Packed":
        return ["Shipped"];
      case "Shipped":
        return ["Delivered"];
      case "Delivered":
      case "Cancelled":
      case "Refund Success":
        return [];
      case "Refund Requested":
        return ["Refund Success"];
      default:
        return [];
    }
  };

  const handleDownloadInvoice = async (orderId: string | undefined, status: string) => {
  if (status !== "Delivered") {
    toast.error("Invoice can only be downloaded once the order is delivered.");
    return;
  }

  if (!orderId) return;

  try {
    setIsDownloading(true); // start spinner
    const res = await fetch(`${API_URL}order/invoice/${orderId}`, {
      method: "GET",
      cache: "no-store",
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

  const orderStatus = getDisplayOrderStatus(data);
  const isShipped =
  ["Shipped", "Out for Delivery", "Delivered"].includes(data.status);

const hasTracking = Boolean((data as any)?.trackingDetails?.trackingNumber);

const shippedDateRaw =
  data.statusHistory?.find((s: any) => s.status === "Shipped")?.updatedAt;

const shippedDate = shippedDateRaw
  ? new Date(shippedDateRaw)
  : null;
  const pricing = getOrderLinePricing(data);
  const defaultTotal = pricing.subtotal;
  const taxPercent = pricing.taxRate;
  const taxAmount = pricing.gstAmount;
  const chargedPerUnit = pricing.chargedPerUnit;




  return (
    <div className="bg-white w-full max-w-3xl p-4 mx-auto rounded-sm drop-shadow-sm">
      <section className="flex justify-between items-center">
        {data.status !== "Paid" && (
          <OrderPaymentViewDialog paymentData={data.paymentFile} currentStatus={data.status} />
        )}
          <Button
            variant="outline"
            onClick={() => handleDownloadInvoice(orderId, data.status)}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2"
          >
            {isDownloading && <FaSpinner className="animate-spin" />}
            {isDownloading ? "Downloading..." : "Download Invoice"}
          </Button>

      </section>
      <section className="mt-6 flex justify-between border-b pb-4">
        <OrderDetailsField label="Order ID:" value={data?._id} />
        <OrderDetailsField
          label="Placed on:"
          value={formatDate(data?.createdAt)}
        />
      </section>

      {/* Order Items */}
      <section className="mt-4 bg-white border-b">
        {data && typeof data.variant !== "string" && (
          <article
            key={data.variant._id}
            className="w-full flex items-center gap-2 mb-5"
          >
            <img
              src={getProductImage(data.variant.productId, data.variant)}
              alt="Product item order img"
              className="w-[80px] h-[80px] object-cover"
            />
            <div className="w-full">
              <h5 className="pl-3 text-lg">
                {typeof data.variant.productId === "object"
                  ? data.variant.productId.name
                  : "-"}
              </h5>
              <h5 className="pl-3 text-lg text-darkGray">
                {data.qty} × {chargedPerUnit.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h5>

            </div>
            <div className="flex flex-col gap-2">
              {/* Total */}
              <OrderDetailsField
                label="Total:"
                value={`₹${defaultTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              />
            
              {/* Tax */}
              <OrderDetailsField
                label={`Tax (${taxPercent}%):`}
                value={`₹${taxAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              />
            </div>

          </article>
        )}
      </section>

      <section className="mt-6 flex justify-between border-b pb-4">
        <h5 className="text-xl">Payment Info:</h5>
        <div className="space-y-1">
          <OrderDetailsField
            label="Total Price:"
            value={`₹${pricing.total.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />

          <OrderDetailsField
            label="Status:"
            value={data?.paymentInfo?.status || "Pending"}
          />
          <OrderDetailsField
            label="Method:"
            value={data?.paymentInfo?.method || "NA"}
          />
          <OrderDetailsField
            label="Transaction ID:"
            value={data?.paymentInfo?.transactionId || "NA"}
          />
        </div>
      </section>
      {data?.paymentAttempts && data.paymentAttempts.length > 0 && (
        <section className="mt-4 border-b pb-4">
          <h4 className="text-lg font-semibold mb-2">Payment Attempts</h4>
          <div className="space-y-2 max-h-44 overflow-auto">
            {data.paymentAttempts
              .slice()
              .reverse()
              .map((attempt: any, idx: number) => (
                <div key={idx} className="border rounded p-2 bg-gray-50 text-sm">
                  <p>Status: <strong>{attempt?.status || "NA"}</strong></p>
                  <p>Txn ID: <strong>{attempt?.paymentId || "NA"}</strong></p>
                  <p>At: <strong>{formatDateTime(attempt?.attemptedAt)}</strong></p>
                  <p>Message: <strong>{attempt?.message || "NA"}</strong></p>
                </div>
              ))}
          </div>
        </section>
      )}
      <section className="mt-6 flex justify-between border-b pb-4">
        <h4 className="text-xl">Shipping Address:</h4>
        <article>
          <OrderDetailsField
            label=""
            value={data?.shippingAddress.instituteAddress1}
          />
          <OrderDetailsField
            label=""
            value={data?.shippingAddress.instituteAddress2}
          />
          <OrderDetailsField
            label=""
            value={
              data?.shippingAddress.district + ", " + data.shippingAddress.state
            }
          />
          <OrderDetailsField
            label=""
            value={"Pin: " + data.shippingAddress.pincode}
          />
        </article>
      </section>

      <section className="mt-6 border-b pb-4">
  <h4 className="text-xl mb-2">Shipping Status</h4>

  {!isShipped && (
    <p className="text-sm text-gray-500">
      Shipment has not been dispatched yet. Tracking details will be available
      once the seller ships the order.
    </p>
  )}

  {isShipped && (
    <div className="space-y-1">
      <OrderDetailsField
        label="Status:"
        value={data.status}
      />

      <OrderDetailsField
        label="Shipped On:"
        value={
          shippedDate
            ? formatDate(shippedDate)
            : "Will be updated"
        }
      />

      <OrderDetailsField
        label="Tracking ID:"
        value={
          hasTracking
            ? (data as any).trackingDetails.trackingNumber
            : "Tracking ID not added by seller yet"
        }
      />

      <OrderDetailsField
        label="Courier:"
        value={
          hasTracking
            ? (data as any).trackingDetails.logisticPartner
            : "Will be available once shipped"
        }
      />
      {hasTracking && (
          <Button
            variant="outline"
            className="mt-2 w-fit"
            onClick={() => {
             const doc = (data as any).trackingDetails.trackingDocument;
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
  >
    Download Courier Slip
  </Button>
)}
    </div>
  )}
</section>


      <section className="flex justify-between items-start mt-4">
        <h4 className="text-[20px] font-semibold">Order Status:</h4>
        {data?.status && (
          <div>
            <article className="mb-2 flex gap-2">
              <OrderDetailsField label={orderStatus} value="" />
            </article>
            <article>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-[200px] mt-2 border h-[35px] rounded-[5px]"
                disabled={data.status === "Delivered" || hasActiveRequest}
              >
                <option value="">Select status</option>
                {getOptionsForStatus().map((option, index) => (
                  <option value={option} key={index}>
                    {option}
                  </option>
                ))}
              </select>
            </article>
            <button
              className="px-3 py-2 bg-accent-yellow rounded-sm mt-4 w-full shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={async () => {
                // 1. Prevent firing if status is empty
                if (!status) {
                  toast.error("Please select a status first");
                  return;
                }
                
                await mutateOrder({
                  status,
                  orderId: orderId || "",
                });

                // 2. Optional: Reset selection after success
                setStatus(""); 
              }}
              // 3. Keep button disabled if pending OR if no status is selected
              disabled={mutationStatus === "pending" || hasActiveRequest || !status}
            >
              {mutationStatus === "pending" ? "Updating.." : "Update Status"}
            </button>
            {hasActiveRequest && (
              <p className="mt-2 text-xs text-amber-700">
                Resolve the active order request first. Normal status updates are locked while a request is in progress.
              </p>
            )}
          </div>
        )}
      </section>

      <OrderRequestPanel order={data} role="admin" />
    </div>
  );
}
