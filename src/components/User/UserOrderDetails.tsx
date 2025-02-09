import { Order } from "../../Types/types";
import OrderDetailsField from "../Seller/OrderDetailsFields";
import { formatDate } from "../UI/Inputs";

type UserOrderDetailsProps = {
  data: Order
}
export default function UserOrderDetails({ data }: UserOrderDetailsProps) {

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
      <section className="mt-6 flex justify-between border-b pb-4">
        <h5 className="text-xl">Shipping Address</h5>
        <div className="space-y-1">
          <OrderDetailsField label="" value={data?.shippingAddress.instituteAddress1} />
          <OrderDetailsField label="" value={data?.shippingAddress.instituteAddress2} />
          <OrderDetailsField label="" value={data.shippingAddress.landmark} />
          <OrderDetailsField label="" value={data?.shippingAddress.district + ", " + data.shippingAddress.state} />
          <OrderDetailsField label="" value={data.shippingAddress.pincode} />
        </div>
      </section>
      <section className="flex justify-between items-center my-4">
        <h4 className="pt-3 text-[20px] font-[600]">Order Status:</h4>
        <h4 className="pt-3 text-[20px] font-[600]">{data?.status}</h4>
      </section>
    </div>
  )
}
