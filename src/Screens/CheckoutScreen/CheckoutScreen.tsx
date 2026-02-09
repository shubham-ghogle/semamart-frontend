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

  const {
    cart,
    clearCart,
    changeQyt,
    removeFromCart,
  } = useCartStore((s) => s);

  const navigate = useNavigate();
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const address = selectedAddressIndex !== null ? user?.addresses?.[selectedAddressIndex] : null;

  const normalizeImage = (src?: string | null) => {
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src;
    return `/images/${src}`;
  };

  // --- Helpers ---
  const getUnitBase = (item: CartItem) =>
    Number(item.price) ||
    Number(item.paymentslip?.basePrice) ||
    Number(item.variant?.discountPrice) ||
    Number(item.variant?.originalPrice) ||
    Number(item.product?.variants?.[0]?.discountPrice) ||
    Number(item.product?.variants?.[0]?.originalPrice) ||
    0;

  const getLineTotals = (item: CartItem) => {
    const qty = Number(item.qty ?? 1);
    const unitBase = getUnitBase(item);
    const taxRate = Number(item.taxClass ?? 0);

    const lineTotalExGST = Number(item.paymentslip?.total) || unitBase * qty;
    const gstAmount = Number(item.paymentslip?.gstAmount) || (lineTotalExGST * taxRate) / 100;
    const lineGrand = Number(item.paymentslip?.grandTotal) || lineTotalExGST + gstAmount;

    return { qty, unitBase, taxRate, lineTotalExGST, gstAmount, lineGrand };
  };

  // Totals
  const { subTotal, totalGST, grandTotal } = (cart || []).reduce((acc, curr) => {
    const { lineTotalExGST, gstAmount, lineGrand } = getLineTotals(curr);
    acc.subTotal += lineTotalExGST;
    acc.totalGST += gstAmount;
    acc.grandTotal += lineGrand;
    return acc;
  }, { subTotal: 0, totalGST: 0, grandTotal: 0 });

  // Payload for API
  const cartToApi = (cart || []).map((el) => {
    const fallbackVariantId = el.product?.variants?.[0]?._id ?? null;
    const unitBase = getUnitBase(el);
    const gstAmountPerLine = Number(el.paymentslip?.gstAmount) || (unitBase * (el.taxClass || 0)) / 100;
    const qty = el.qty ?? 1;
    const totalPrice = Number(el.paymentslip?.grandTotal) || (unitBase + gstAmountPerLine / qty) * qty;
    const adminCommission = (el.product?.commission || 0) * qty;

    return {
      shopId: typeof el.product?.shopId === "string" ? el.product.shopId : (el.product?.shopId as Seller)?._id,
      productId: el.product!._id,
      variantId: el.variant?._id ?? fallbackVariantId,
      qty,
      totalPrice,
      tax: el.taxClass || 0,
      unitPrice: el.variant?.originalPrice ?? 0,
      dispatchState: el.product?.dispatchState ?? null,
      dispatchDistrict: el.product?.dispatchDistrict ?? null,
      adminCommision: adminCommission,
      sellerPayout: totalPrice - adminCommission,
      discounted_price: unitBase,
    };
  });

  const orderPayload = {
    cart: cartToApi,
    shippingAddress: address,
    user: user?._id ?? null,
    totalPrice: grandTotal,
    paymentInfo: { id: "pending", status: "Pending", method: "Manual" },
  };

  async function postOrder(data: any) {
    const res = await fetch(API_URL + "order/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Could not create order");
    return res;
  }

  const { mutateAsync, status } = useMutation({
    mutationFn: (data: any) => postOrder(data),
    onError: (err: any) => toast.error(err.message ?? "Failed to create order"),
    onSuccess: () => clearCart(),
  });

  async function handlePlaceOrder() {
    if (!address) {
      toast.warning("Please select a shipping address before placing order.", { position: "top-left" });
      return;
    }

    for (const c of cart) {
      if (!c.product) return;
      const minMaxRule = c.product.minmaxrule as unknown as string;
      const { minQty } = JSON.parse(minMaxRule) as { minQty: string; maxQty: string };
      const min = parseInt(minQty);
      if (!isNaN(min) && c.qty < min) {
        toast.error(`${c.product.name} has the minimum order quantity of ${min}`);
        return;
      }
    }

    await mutateAsync(orderPayload);
  }

  // Success screen
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
            <button onClick={() => navigate("/")} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">OK</button>
            <button onClick={() => navigate("/account/orders")} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 ml-3">Go to Orders</button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <a href="/" className="text-blue-600 hover:underline">Continue Shopping</a>
      </div>
    );
  }

  // Checkout Page UI
  return (
    <div className="mt-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">

        {/* Items + Address */}
        <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Items</h2>

          <div className="divide-y">
            {cart.map((item) => {
              const { qty, unitBase, taxRate, gstAmount, } = getLineTotals(item);
              const productId = typeof item.productId === "string" ? item.productId : (item.productId as any)?._id;
              const variantId = typeof item.variantId === "string" ? item.variantId : (item.variantId as any)?._id;
              const thumb = normalizeImage(item.variant?.thumbnail) ?? (item.product?.images?.[0] ? `/images/${item.product.images[0]}` : "/placeholder.png");

              const gstPerUnit = gstAmount / qty;

              return (
                <article key={`${productId}-${variantId ?? "nv"}`} className="flex items-center gap-4 py-4">
                  <img src={thumb} alt={item.product?.name ?? "Product"} className="w-[80px] h-[80px] object-cover rounded shadow-sm" />

                  <div className="flex-1">
                    <h5 className="text-lg font-medium">{item.product?.name}</h5>

                    <p className="text-gray-600">Unit Price (Excl. GST): {formatter.format(unitBase)}</p>
                    <p className="text-gray-600">Quantity: {qty}</p>
                    <p className="text-gray-500">GST ({taxRate}%): {formatter.format(gstPerUnit)} per unit</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex border rounded overflow-hidden">
                        <button disabled={qty === 1} onClick={() => changeQyt(productId, variantId ?? null, -1)} className="w-8 h-8 bg-gray-100">−</button>
                        <div className="px-3 flex items-center">{qty}</div>
                        <button onClick={() => changeQyt(productId, variantId ?? null, 1)} className="w-8 h-8 bg-gray-100">+</button>
                      </div>
                      <button onClick={() => removeFromCart(productId, variantId ?? null)} className="text-sm text-red-600">REMOVE</button>
                    </div>
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
                  className={`rounded-lg cursor-pointer transition-all border p-4 ${selectedAddressIndex === i ? "border-yellow-500 bg-yellow-50 shadow-lg" : "border-gray-300 hover:border-gray-400"}`}
                  onClick={() => setSelectedAddressIndex(i)}
                >
                  <div className="text-gray-700">
                    <div>{el.instituteAddress1}</div>
                    {el.instituteAddress2 && <div>{el.instituteAddress2}</div>}
                    <div>{el.district}, {el.state} - {el.pincode}</div>
                    {el.landmark && <div>Landmark: {el.landmark}</div>}
                    {user?.phoneNumber && <div>📞 {user.phoneNumber}</div>}
                  </div>
                  {selectedAddressIndex === i && <div className="text-green-600 font-medium mt-1 text-sm">✓ Selected</div>}
                </article>
              ))}
            </div>
          ) : null}
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
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Grand Total (Incl. GST)</span>
            <span>{formatter.format(grandTotal)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={status === "pending"}
            className="w-full mt-6 py-3 text-white rounded"
            style={{ background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)" }}
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
