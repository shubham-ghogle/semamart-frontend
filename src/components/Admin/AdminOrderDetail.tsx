import { Order } from "@/Types/types";
import { useState } from "react";
import { useParams } from "react-router";
import OrderDetailsField from "../Seller/OrderDetailsFields";
import { API_URL, BASE_URL } from "@/data";
import { formatDate } from "../UIComponents/Inputs";
import { useAdminOrderMutation } from "@/Screens/Admin/Admin.HooksAndUtils";
import { Button } from "../ui/button";
import OrderPaymentViewDialog from "./OrderPaymentViewDialog";

type AdminOrderDetailProps = {
  data: Order;
};

export default function AdminOrderDetail({ data }: AdminOrderDetailProps) {
  const { orderId } = useParams();
  const { mutationStatus, mutateOrder } = useAdminOrderMutation();
  const [status, setStatus] = useState("");

  const getOptionsForStatus = () => {
    const statuses = {
      default: ["Delivered"],
      refund: ["Processing refund", "Refund Success"],
    };

    // if (statuses.refund.includes(currentStatus)) {
    //   return statuses.refund.slice(statuses.refund.indexOf(currentStatus));
    // }

    return statuses.default;
  };

  const handleDownloadInvoice = async (orderId: string | undefined) => {
    if (!orderId) return;
    try {
      const res = await fetch(`${API_URL}order/invoice/${orderId}`, {
        method: "GET",
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Invoice download failed:", err);
    }
  };

  const orderStatus = data.status === "Paid" ? "Paid: Verify Payment" : data.status
  const isShipped =
  ["Shipped", "Out for Delivery", "Delivered"].includes(data.status);

const hasTracking = Boolean((data as any)?.trackingDetails?.trackingNumber);

const shippedDateRaw =
  data.statusHistory?.find((s: any) => s.status === "Shipped")?.updatedAt;

const shippedDate = shippedDateRaw
  ? new Date(shippedDateRaw)
  : null;
  const defaultTotal =
    data.qty * (data.variant && typeof data.variant !== "string"
      ? data.variant.discountPrice ?? 0
      : 0);
 const taxPercent = data.tax || 0;
  const taxAmount = (defaultTotal * taxPercent) / 100;




  return (
    <div className="bg-white w-full max-w-3xl p-4 mx-auto rounded-sm drop-shadow-sm">
      <section className="flex justify-between items-center">
        <OrderPaymentViewDialog paymentData={data.paymentFile} currentStatus={data.status} />
        <Button
          variant="outline"
          onClick={() => handleDownloadInvoice(orderId)}
        >
          Download Invoice
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
              src={BASE_URL + "/images/" + data.variant.thumbnail}
              alt="Product item order img"
              className="w-[80x] h-[80px]"
            />
            <div className="w-full">
              <h5 className="pl-3 text-lg">
                {typeof data.variant.productId === "object"
                  ? data.variant.productId.name
                  : "-"}
              </h5>
              <h5 className="pl-3 text-lg text-darkGray">
                {data.qty} × {(data.variant?.discountPrice ?? data.variant?.discountPrice ?? 0).toLocaleString("en-IN", {
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
            value={`₹${data?.totalPrice.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />

          {/* <OrderDetailsField
            label="Status:"
            value={
              data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"
            }
          />
          <OrderDetailsField
            label="Method:"
            value={
              data?.paymentInfo?.method ? data?.paymentInfo?.method : "Not Paid"
            }
          /> */}
        </div>
      </section>
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
                disabled={data.status === "Delivered"}
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
              className="px-3 py-2 bg-accent-yellow rounded-sm mt-4 w-full shadow-md"
              onClick={async () =>
                await mutateOrder({
                  status,
                  orderId: orderId || "",
                })
              }
              disabled={mutationStatus === "pending"}
            >
              {mutationStatus === "pending" ? "Updating.." : "Update Status"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
