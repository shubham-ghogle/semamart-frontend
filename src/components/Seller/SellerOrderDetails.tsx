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

type SellerOrderDetailProps = {
  data: Order;
};

export default function SellerOrderDetail({ data }: SellerOrderDetailProps) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { mutationStatus, mutateOrder } = useSellerOrderMutation();
  const [status, setStatus] = useState("");

  // ✅ Default price total (without tax)
  const defaultTotal =
    data.qty * (data.variant && typeof data.variant !== "string"
      ? data.variant.discountPrice ?? 0
      : 0);
  const taxPercent = data.tax || 0;
  const taxAmount = (defaultTotal * taxPercent) / 100;


  const getOptionsForStatus = () => {
    const statuses = {
      default: ["Packed", "Shipped"],
      refund: ["Processing refund", "Refund Success"],
    };
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
      {/* Download Invoice */}
      <section className="flex justify-end items-center">
        <Button
          variant="outline"
          onClick={() => handleDownloadInvoice(orderId)}
        >
          Download Invoice
        </Button>
      </section>

      {/* Order Header */}
      <section className="w-full flex items-center bg-white justify-between p-6 border-b">
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
                ₹{data.qty} × {(data.variant?.discountPrice ?? 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}

              </h5>
            </div>
            {/* Total (Excl. Tax) */}
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

      {/* Payment Info */}
      <section className="mt-6 flex justify-between border-b pb-4">
        <h5 className="text-xl">Payment Info:</h5>
        <div className="space-y-1">
          {/* Includes tax */}
          <OrderDetailsField
            label="Total Price:"
            value={`₹${data.totalPrice.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />

        </div>
      </section>

      {/* Order Status */}
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
                {mutationStatus === "pending"
                  ? "Updating.."
                  : "Update Status"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
