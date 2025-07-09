import { useParams } from "react-router";
import { useSellerOrderMutation } from "../../Screens/Seller/Seller.Hooks";
import { useState } from "react";
import OrderDetailsField from "./OrderDetailsFields";
import { Order } from "../../Types/types";
import { formatDate } from "../UI/Inputs";

type SellerOrderDetailProps = {
  data: Order
}
export default function SellerOrderDetail({ data }: SellerOrderDetailProps) {

  const { orderId } = useParams()

  const { mutationStatus, mutateOrder } = useSellerOrderMutation()


  const [status, setStatus] = useState("")

  const getOptionsForStatus = (currentStatus: string) => {
    const statuses = {
      default: [
        "Processing",
        "Transferred to delivery partner",
        "Shipping",
        "Received",
        "On the way",
        "Delivered",
      ],
      refund: ["Processing refund", "Refund Success"],
    };

    if (statuses.refund.includes(currentStatus)) {
      return statuses.refund.slice(statuses.refund.indexOf(currentStatus));
    }

    return statuses.default.slice(statuses.default.indexOf(currentStatus));
  };

  return (
    <div className="bg-white w-full max-w-3xl p-4 mx-auto rounded drop-shadow">
      <section className="w-full flex items-center bg-white justify-between p-6 border-b ">
        <OrderDetailsField label="Order ID:" value={data?._id} />
        <OrderDetailsField label="Placed on:" value={formatDate(data?.createdAt)} />
      </section>
      {/* Order Items */}
      <section className="mt-4 bg-white border-b">
        {data &&
          data?.cart.map((item) => (
            <article key={item.product._id} className="w-full flex items-center gap-2 mb-5">
              <img
                src={"/baseUrl" + "/" + item.product.images[0]}
                alt="Product item order img"
                className="w-[80x] h-[80px]"
              />
              <div className="w-full">
                <h5 className="pl-3 text-lg">{item.product.name}</h5>
                <h5 className="pl-3 text-lg text-darkGray">
                  US${item.qty} x {item.product.discountPrice}
                </h5>
              </div>
              <OrderDetailsField label="Total:" value={item.qty * item.product.discountPrice} />
            </article>
          ))}
      </section>
      <section className="mt-6 flex justify-between border-b pb-4">
        <h5 className="text-xl">Payment Info:</h5>
        <div className="space-y-1">
          <OrderDetailsField label="Total Price:" value={data?.totalPrice} />
          <OrderDetailsField label="Status:" value={data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"} />
          <OrderDetailsField label="Type:" value={data?.paymentInfo?.type ? data?.paymentInfo?.type : "Not Paid"} />
        </div>
      </section>
      <section className="flex justify-between mt-4">
        <h4 className="pt-3 text-[20px] font-[600]">Order Status:</h4>
        {data?.status && (
          <div>
            <article>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-[200px] mt-2 border h-[35px] rounded-[5px]"
                disabled={data.status === "Delivered"}
              >
                {getOptionsForStatus(data.status).map((option, index) => (
                  <option value={option} key={index}>
                    {option}
                  </option>
                ))}
              </select>
            </article>
            <button
              className="px-3 py-2 bg-accentYellow rounded mt-4 w-full shadow-md"
              onClick={async () => (await mutateOrder({ status, currentStatus: data?.status || "", orderId: orderId || "" }))}
              disabled={mutationStatus === "pending"}
            >
              {mutationStatus === "pending" ? "Updating.." :
                "Update Status"
              }
            </button>
          </div>
        )}
      </section>
    </div >
  )
}
