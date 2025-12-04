import { useParams } from "react-router";
import { useSellerOrderMutation } from "../../Screens/Seller/Seller.Hooks";
import { useState } from "react";
import OrderDetailsField from "./OrderDetailsFields";
import { Order } from "../../Types/types";
import { formatDate } from "../UIComponents/Inputs";
import { API_URL, BASE_URL } from "@/data";
import TrackingDetailDialog from "../Admin/TrackingDetailDialog";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import OrderPaymentViewDialog from "../Admin/OrderPaymentViewDialog";

type SellerOrderDetailProps = {
  data: Order;
};

export default function SellerOrderDetail({ data }: SellerOrderDetailProps) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { mutationStatus, mutateOrder } = useSellerOrderMutation();
  const [status, setStatus] = useState("");

  const getOptionsForStatus = () => {
    const statuses = {
      default: [
        "Processing",
        "Packed",
        "Shipped",
        // "Received",
        // "On the way",
        // "Delivered",
      ],
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

  return (
    <div className="bg-white w-full max-w-3xl p-4 mx-auto rounded-sm drop-shadow-sm">
      <section className="flex justify-between items-center">
        <OrderPaymentViewDialog paymentData={data.paymentFile } />
        <Button
          variant="outline"
          onClick={() => handleDownloadInvoice(orderId)}
        >
          Download Invoice
        </Button>
      </section>

      <section className="w-full flex items-center bg-white justify-between p-6 border-b ">
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
            key={data.variant?._id}
            className="w-full flex items-center gap-2 mb-5"
          >
            <img
              src={BASE_URL + "/images/" + data.variant?.thumbnail}
              alt="Product item order img"
              className="w-[80px] h-[80px] object-cover"
            />
            <div className="w-full">
              <h5 className="pl-3 text-sm">
                {typeof data.variant?.productId === "object"
                  ? data.variant.productId?.name
                  : "-"}
              </h5>
              <h5 className="pl-3 text-lg text-darkGray">
                 ₹{data.qty} x {data.variant?.discountPrice}
              </h5>
            </div>
            <OrderDetailsField
              label="Tax (%):"
              value={ (data.tax || 0)}
            />
            <OrderDetailsField
              label="Total:"
              value={ data.totalPrice}
            />
          </article>
        )}
      </section>

      <section className="mt-6 flex justify-between border-b pb-4">
        <h5 className="text-xl">Payment Info:</h5>
        <div className="space-y-1">
          <OrderDetailsField label="Total Price:" value={data?.totalPrice} />
          <OrderDetailsField
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
          />
        </div>
      </section>

      <section className="flex justify-between items-start mt-4">
        <h4 className="text-[20px] font-semibold">Order Status:</h4>
        {data?.status && (
          <div className="w-full max-w-xs">
            <article className="mb-2 flex gap-2">
              <OrderDetailsField label={data.status} value="" />
              {data.status === "Shipped" && <TrackingDetailDialog />}
            </article>

            <article>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-2 border h-[35px] rounded-[5px] px-2"
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

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="px-3 py-2 bg-red-400 rounded-sm shadow-sm text-sm"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>

              <button
                className="flex-1 px-3 py-2 bg-accent-yellow rounded-sm shadow-md text-sm text-center"
                onClick={async () =>
                  await mutateOrder({
                    status,
                    currentStatus: data?.status || "",
                    orderId: orderId || "",
                  })
                }
                disabled={mutationStatus === "pending"}
              >
                {mutationStatus === "pending" ? "Updating.." : "Update Status"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
