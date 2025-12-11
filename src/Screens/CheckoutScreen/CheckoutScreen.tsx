// src/Screens/CheckoutScreen/CheckoutScreen.tsx
import { useState } from "react";
import { useCartStore, CartItem } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { Address, Seller } from "../../Types/types";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import RelatedProducts from "../../components/UIComponents/RelatedProductCard";
import { toast } from "react-toastify";
import { API_URL } from "@/data";
import { useMutation } from "@tanstack/react-query";

export default function CheckoutScreen(): JSX.Element {
  const { user } = useUserStore((s) => s);
  const { cart, clearCart } = useCartStore((s) => s);
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);

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

  // authoritative unit price resolver: prefer stored item.price -> paymentslip.basePrice -> variant/product fallbacks
  const getUnitPrice = (item: CartItem) => {
    const variantObj = item.variant && typeof item.variant === "object" ? (item.variant as any) : null;
    const prodVariant0 = (item.product as any)?.variants?.[0];

    return (
      Number(item.price) ||
      Number(item.paymentslip?.basePrice) ||
      Number(variantObj?.discountPrice) ||
      Number(variantObj?.originalPrice) ||
      Number(prodVariant0?.discountPrice) ||
      Number(prodVariant0?.originalPrice) ||
      0
    );
  };

  // ✅ Calculate totals using authoritative paymentslip when available
  const { subTotal, totalGST, grandTotal } = (cart || []).reduce(
    (acc, curr) => {
      const qty = Number(curr.qty || 0);
      const taxRate = Number(curr.taxClass || 0);

      const unitPrice = getUnitPrice(curr);
      const lineExGST = Number(curr.paymentslip?.total) || unitPrice * qty;
      const gstAmount = Number(curr.paymentslip?.gstAmount) || (lineExGST * taxRate) / 100;
      const lineGrand = Number(curr.paymentslip?.grandTotal) || lineExGST + gstAmount;

      acc.subTotal += lineExGST;
      acc.totalGST += gstAmount;
      acc.grandTotal += lineGrand;
      return acc;
    },
    { subTotal: 0, totalGST: 0, grandTotal: 0 }
  );

  // Prepare API payload using authoritative stored prices (prefer paymentslip.grandTotal if present)
  const cartToApi = (cart || []).map((el) => {
    const fallbackVariantId = el.variant && typeof el.variant === "object" ? (el.variant as any)?._id ?? null : el.product?.variants?.[0]?._id ?? null;
    const unitPrice = getUnitPrice(el);
    const gstRate = el.taxClass || 0;
    const gstAmountPerUnit = (unitPrice * gstRate) / 100;

    const totalPrice = Number(el.paymentslip?.grandTotal) || (unitPrice + gstAmountPerUnit) * el.qty;

    return {
      shopId:
        typeof el.product?.shopId === "string"
          ? el.product.shopId
          : (el.product?.shopId as Seller)?._id,
      productId: el.product!._id,
      variantId: el.variant && typeof el.variant === "object" ? el.variant._id ?? fallbackVariantId : fallbackVariantId,
      qty: el.qty,
      totalPrice,
      tax: el.taxClass || 0,
      unitPrice: unitPrice,
    };
  });

  const orderPayload = {
    cart: cartToApi,
    shippingAddress: address,
    user: user?._id ?? null,
    totalPrice: grandTotal,
    paymentInfo: { id: "pending", status: "Pending", method: "Razorpay" },
  };

  async function postOrder(data: any) {
    const res = await fetch(API_URL + "order/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Could not create order");
    }
    return res;
  }

  const { mutateAsync, status } = useMutation({
    mutationFn: (data: any) => postOrder(data),
    onError: (err: any) => {
      toast.error(err.message || "Order creation failed");
    },
    onSuccess: () => {
      clearCart();
    },
  });

  async function handlePlaceOrder() {
    if (!address) {
      toast.warning("Please select a shipping address before placing order.", {
        position: "top-left",
      });
      return;
    }

    for (const c of cart) {
      if (!c.product) return;
      const minMaxRule = c.product.minmaxrule as unknown as string;
      try {
        const parsedMinMaxRule = JSON.parse(minMaxRule) as { minQty: string; maxQty: string };
        const minQty = parseInt(parsedMinMaxRule.minQty);
        if (!isNaN(minQty)) {
          if (c.qty < minQty) {
            toast.error(`${c.product.name} has the minimum order quantity of ${minQty}`);
            return;
          }
        }
      } catch (err) {
        // ignore parse error and continue
      }
    }

    await mutateAsync(orderPayload);
  }

  // ✅ Success screen
  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        <Confetti />
        <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-lg mx-4">
          <h1 className="text-3xl font-bold text-green-600 mb-3">🎉 Order Created Successful!</h1>
          <p className="text-gray-700 mb-4">
            You can make payments for your order items by going in your order history.
          </p>
          <div className="flex justify-center">
            <button onClick={() => navigate("/")} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
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

  // ✅ Checkout Page UI
  return (
    <div className="mt-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        {/* Items + Address */}
        <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Items</h2>
          <div className="divide-y">
            {cart.map((item) => {
              const unitPrice = getUnitPrice(item);
              const gstRate = item.taxClass ?? 0;
              const gstAmount = (unitPrice * gstRate) / 100;
              const priceInclGST = unitPrice + gstAmount;

              const thumb =
                normalizeImage(item.variant && typeof item.variant === "object" ? (item.variant as any).thumbnail : null) ??
                (item.product?.images?.[0] ? `/images/${item.product.images[0]}` : "/placeholder.png");

              const key = item.variant && typeof item.variant === "object"
                ? `${item.product!._id}-${(item.variant as any)._id}`
                : item.product!._id;

              // Prefer authoritative paymentslip display values if available
              const displayExcl = Number(item.paymentslip?.total) || unitPrice * item.qty;
              const displayIncl = Number(item.paymentslip?.grandTotal) || (unitPrice + gstAmount) * item.qty;

              return (
                <article key={key} className="flex items-center gap-4 py-4">
                  <img src={thumb} alt={item.product?.name ?? "Product"} className="w-[80px] h-[80px] object-cover rounded shadow-sm" />
                  <div className="flex-1">
                    <h5 className="text-lg font-medium">{item.product?.name}</h5>
                    <p className="text-gray-600">
                      {item.qty} × {formatter.format(unitPrice)} (Excl. GST)
                    </p>
                    <p className="text-sm text-gray-500">
                      GST: {gstRate}% • Incl. GST: <strong>{formatter.format(displayIncl)}</strong>
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
              {user.addresses.map((el: Address, i: number) => (
                <article
                  key={i}
                  className={`rounded-lg cursor-pointer transition-all border p-4 ${
                    selectedAddressIndex === i ? "border-yellow-500 bg-yellow-50 shadow-lg" : "border-gray-300 hover:border-gray-400"
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
                  {selectedAddressIndex === i && <div className="text-green-600 font-medium mt-1 text-sm">✓ Selected</div>}
                </article>
              ))}

              <button
                className="border rounded-lg py-3 font-semibold text-[#1C647C] bg-green-50 hover:bg-green-100 transition"
                onClick={() => toast.info("Add new address flow coming soon!", { position: "top-left" })}
              >
                + Add New Address
              </button>
            </div>
          ) : (
            <div className="text-gray-600">
              No saved addresses.{" "}
              <button className="text-blue-600 underline" onClick={() => toast.info("Add new address flow coming soon!", { position: "top-left" })}>
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
          <p className="text-sm text-gray-500 mt-2">Estimated delivery: 6-7 business days</p>

          <button
            onClick={handlePlaceOrder}
            className={`w-full mt-6 py-3 rounded font-semibold shadow cursor-pointer ${
              selectedAddressIndex === null || status === "pending" ? "bg-gray-400 text-white" : "text-white"
            }`}
            style={selectedAddressIndex !== null && status !== "pending" ? { background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)" } : {}}
            disabled={selectedAddressIndex === null || status === "pending"}
          >
            {status === "pending" ? "Creating Order..." : "Create Order"}
          </button>
        </aside>
      </div>

      {/* Related Products */}
      {cart.length > 0 && (
        <div className="space-y-8 mt-12 w-full max-w-[1600px] mx-auto px-4">
          <hr className="border-t border-gray-400" />
          <h2 className="font-bold text-2xl mt-6 text-center text-[#1C647C]">Related Products</h2>
          <div className="flex flex-wrap justify-center mt-8">
            <RelatedProducts productType={(cart[0].product as any).productType} productId={(cart[0].product as any)._id} />
          </div>
        </div>
      )}
    </div>
  );
}
