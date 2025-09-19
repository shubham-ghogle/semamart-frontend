import { useState } from "react";
import { Order, Product, Variant } from "../../Types/types";
import OrderDetailsField from "../Seller/OrderDetailsFields";
import { formatDate } from "../UIComponents/Inputs";
import ReviewModal from "./ReviewModal";

type UserOrderDetailsProps = {
  data: Order;
};

export default function UserOrderDetails({ data }: UserOrderDetailsProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingProdutId, setReviewingProductId] = useState("");

  function handleAddReview(productId: string) {
    setIsReviewModalOpen(true);
    setReviewingProductId(productId);
  }

  function closeReviewModal() {
    setIsReviewModalOpen(false);
  }

  return (
    <>
      <div className="bg-white w-full max-w-3xl p-4 mx-auto rounded-sm drop-shadow-sm">
        {/* Order Info */}
        <section className="w-full flex items-center bg-white justify-between p-6 border-b ">
          <OrderDetailsField label="Order ID:" value={data?._id} />
          <OrderDetailsField
            label="Placed on:"
            value={formatDate(data?.createdAt)}
          />
        </section>

        {/* Order Items */}
        <section className="mt-4 bg-white border-b">
          {data?.cart.map((item) => {
            // Handle product (may be ID or populated object)
            const product: Product | null =
              typeof item.productId === "string" ? null : item.productId;

            // Handle variant (may be ID or populated object)
            const variant: Variant | null =
              typeof item.variantId === "string" ? null : item.variantId;

            const price = variant ? variant.originalPrice : 0;

            return (
              <article
                key={product?._id || String(item.productId)}
                className="w-full grid grid-cols-[7fr_1fr] gap-4 items-center mb-5"
              >
                <section className="w-full flex items-center gap-2">
                  <img
                    src={
                      product?.images && product.images.length > 0
                        ? "/baseUrl/" + product.images[0]
                        : "/placeholder.png"
                    }
                    alt="Product item order img"
                    className="w-[80px] h-[80px]"
                  />
                  <div className="w-full">
                    <h5 className="pl-3 text-lg">{product?.name || "Product"}</h5>
                    <h5 className="pl-3 text-lg text-dark-gray">
                      US${item.qty} x {price}
                    </h5>
                  </div>
                  <OrderDetailsField label="Total:" value={item.qty * price} />
                </section>

                {data.status === "Delivered" && !item.isReviewed && (
                  <div className="mr-4">
                    <button
                      onClick={() =>
                        handleAddReview(product?._id || String(item.productId))
                      }
                      className="bg-accent-yellow text-white text-sm rounded-md p-1"
                    >
                      Add Review
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* Payment Info */}
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
              label="Type:"
              value={
                data?.paymentInfo?.type ? data?.paymentInfo?.type : "Not Paid"
              }
            />
          </div>
        </section>

        {/* Shipping Address */}
        <section className="mt-6 flex justify-between border-b pb-4">
          <h5 className="text-xl">Shipping Address</h5>
          <div className="space-y-1">
            <OrderDetailsField
              label=""
              value={data?.shippingAddress.instituteAddress1}
            />
            <OrderDetailsField
              label=""
              value={data?.shippingAddress.instituteAddress2}
            />
            <OrderDetailsField label="" value={data.shippingAddress.landmark} />
            <OrderDetailsField
              label=""
              value={
                data?.shippingAddress.district +
                ", " +
                data.shippingAddress.state
              }
            />
            <OrderDetailsField
              label=""
              value={data.shippingAddress.pincode}
            />
          </div>
        </section>

        {/* Order Status */}
        <section className="flex justify-between items-center my-4">
          <h4 className="pt-3 text-[20px] font-semibold">Order Status:</h4>
          <h4 className="pt-3 text-[20px] font-semibold">{data?.status}</h4>
        </section>
      </div>

      {isReviewModalOpen && (
        <ReviewModal
          onCloseModal={closeReviewModal}
          productId={reviewingProdutId}
          orderId={data._id}
        />
      )}
    </>
  );
}
