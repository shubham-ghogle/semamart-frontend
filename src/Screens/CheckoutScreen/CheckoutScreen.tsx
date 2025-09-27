// src/Screens/CheckoutScreen/CheckoutScreen.tsx
import { useState } from "react";
import { useCartStore, CartItem } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { Seller } from "../../Types/types";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import RelatedProducts from "../../components/UIComponents/RelatedProductCard";
import { toast } from "react-toastify";

export default function CheckoutScreen(): JSX.Element {
  const { user } = useUserStore((s) => s);
  const { cart, clearCart } = useCartStore((s) => s);
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const address =
    selectedAddressIndex !== null ? user?.addresses?.[selectedAddressIndex] : null;

  const normalizeImage = (src?: string | null) => {
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src;
    return `/images/${src}`;
  };

  const getUnitPrice = (item: CartItem) =>
    item.variant?.discountPrice ??
    item.variant?.originalPrice ??
    item.product?.variants?.[0]?.discountPrice ??
    item.product?.variants?.[0]?.originalPrice ??
    0;

  // ✅ Calculate totals
  const { subTotal, totalGST, grandTotal } = (cart || []).reduce(
    (acc, curr) => {
      const price = getUnitPrice(curr);
      const gstRate = curr.taxClass ?? 0;
      const gstAmount = (price * gstRate) / 100;

      acc.subTotal += curr.qty * price;
      acc.totalGST += curr.qty * gstAmount;
      acc.grandTotal += curr.qty * (price + gstAmount);
      return acc;
    },
    { subTotal: 0, totalGST: 0, grandTotal: 0 }
  );

  const cartToApi = (cart || []).map((el) => {
    const fallbackVariantId = el.product?.variants?.[0]?._id ?? null;
    const unitPrice = getUnitPrice(el);

    return {
      shopId:
        typeof el.product?.shopId === "string"
          ? el.product.shopId
          : (el.product?.shopId as Seller)?._id,
      productId: el.product!._id,
      variantId: el.variant?._id ?? fallbackVariantId,
      qty: el.qty,
      totalPrice: unitPrice * el.qty,
    };
  });

  const orderPayload = {
    cart: cartToApi,
    shippingAddress: address,
    user: user?._id ?? null,
    totalPrice: grandTotal,
    paymentInfo: { id: "test_payment", status: "Pending", type: "Cash on Delivery" },
  };

  async function handlePlaceOrder() {
    if (!address) {
      toast.warning("Please select a shipping address before placing order.", {
        position: "top-left",
      });
      return;
    }
    setPlacingOrder(true);
    try {
      const res = await fetch("/api/v2/order/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();

      if (data.success) {
        clearCart();
        setSuccess(true);
      } else {
        toast.error("Failed to place order: " + (data.message || "Unknown error"), {
          position: "top-left",
        });
      }
    } catch (err) {
      console.error("Order error", err);
      toast.error("Something went wrong placing the order.", { position: "top-left" });
    } finally {
      setPlacingOrder(false);
    }
  }

  // ✅ Success screen
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        <Confetti />
        <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-lg mx-4">
          <h1 className="text-3xl font-bold text-green-600 mb-3">
            🎉 Order Placed Successfully!
          </h1>
          <p className="text-gray-700 mb-4">
            Thank you for your order. We've received it and will begin processing.
          </p>

          {address && (
            <div className="text-left bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-semibold mb-1">Shipping Address</h3>
              <div className="text-sm text-gray-700">
                <div>{address.instituteAddress1}</div>
                {address.instituteAddress2 && <div>{address.instituteAddress2}</div>}
                <div>
                  {address.district}, {address.state} - {address.pincode}
                </div>
                {address.landmark && <div>Landmark: {address.landmark}</div>}
                {user?.phoneNumber && <div>📞 {user.phoneNumber}</div>}
              </div>
            </div>
          )}

          <p className="text-gray-600 text-sm mb-4">
            ✅ Check your orders section for further details.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <a href="/" className="text-blue-600 hover:underline">
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="mt-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        {/* Items + Address */}
        <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Items</h2>
          <div className="divide-y">
            {cart.map((item) => {
              const price = getUnitPrice(item);
              const gstRate = item.taxClass ?? 0;
              const gstAmount = (price * gstRate) / 100;
              const priceInclGST = price + gstAmount;

              const thumb =
                normalizeImage(item.variant?.thumbnail) ??
                (item.product?.images?.[0]
                  ? `/images/${item.product.images[0]}`
                  : "/placeholder.png");

              const key = item.variant
                ? `${item.product!._id}-${item.variant._id}`
                : item.product!._id;

              return (
                <article key={key} className="flex items-center gap-4 py-4">
                  <img
                    src={thumb}
                    alt={item.product?.name ?? "Product"}
                    className="w-[80px] h-[80px] object-cover rounded shadow-sm"
                  />
                  <div className="flex-1">
                    <h5 className="text-lg font-medium">{item.product?.name}</h5>
                    <p className="text-gray-600">
                      {item.qty} × {formatter.format(price)} (Excl. GST)
                    </p>
                    <p className="text-sm text-gray-500">
                      GST: {gstRate}% • Incl. GST:{" "}
                      <strong>{formatter.format(item.qty * priceInclGST)}</strong>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Address Section */}
          <h2 className="text-xl font-semibold mt-8 mb-4">Select Address</h2>
          {user?.addresses?.length ? (
            <div className="flex flex-col gap-4">
              {user.addresses.map((el: any, i: number) => (
                <article
                  key={i}
                  className={`rounded-lg cursor-pointer transition-all border p-4 ${
                    selectedAddressIndex === i
                      ? "border-yellow-500 bg-yellow-50 shadow-lg"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedAddressIndex(i)}
                >
                  <div className="text-gray-700">
                    <div>{el.instituteAddress1}</div>
                    {el.instituteAddress2 && <div>{el.instituteAddress2}</div>}
                    <div>
                      {el.district}, {el.state} - {el.pincode}
                    </div>
                    {el.landmark && <div>Landmark: {el.landmark}</div>}
                    {user?.phoneNumber && <div>📞 {user.phoneNumber}</div>}
                  </div>
                  {selectedAddressIndex === i && (
                    <div className="text-green-600 font-medium mt-1 text-sm">
                      ✓ Selected
                    </div>
                  )}
                </article>
              ))}

              <button
                className="border rounded-lg py-3 font-semibold text-[#1C647C] bg-green-50 hover:bg-green-100 transition"
                onClick={() =>
                  toast.info("Add new address flow coming soon!", {
                    position: "top-left",
                  })
                }
              >
                + Add New Address
              </button>
            </div>
          ) : (
            <div className="text-gray-600">
              No saved addresses.{" "}
              <button
                className="text-blue-600 underline"
                onClick={() =>
                  toast.info("Add new address flow coming soon!", {
                    position: "top-left",
                  })
                }
              >
                Add one now
              </button>
            </div>
          )}
        </section>

        {/* Order Summary */}
        <aside className="bg-white p-6 rounded-lg shadow h-fit sticky top-20">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal (Excl. GST)</span>
            <span>{formatter.format(subTotal)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Total GST</span>
            <span>{formatter.format(totalGST)}</span>
          </div>
          <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-300 px-3 py-2 rounded mb-3">
            🚚 Shipping at per actual*
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Grand Total (Incl. GST)</span>
            <span>{formatter.format(grandTotal)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Estimated delivery: 6-7 business days
          </p>

          <button
            onClick={handlePlaceOrder}
            className={`w-full mt-6 py-3 rounded font-semibold shadow cursor-pointer ${
              selectedAddressIndex === null || placingOrder
                ? "bg-gray-400 text-white"
                : "text-white"
            }`}
            style={
              selectedAddressIndex !== null && !placingOrder
                ? { background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)" }
                : {}
            }
            disabled={selectedAddressIndex === null || placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </div>

      {/* Related Products */}
      {cart.length > 0 && (
        <div className="space-y-8 mt-12 w-full max-w-[1600px] mx-auto px-4">
          <hr className="border-t border-gray-400" />
          <h2 className="font-bold text-2xl mt-6 text-center text-[#1C647C]">
            Related Products
          </h2>
          <div className="flex flex-wrap justify-center mt-8">
            <RelatedProducts
              productType={(cart[0].product as any).productType}
              productId={(cart[0].product as any)._id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
