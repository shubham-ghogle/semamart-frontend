// src/Screens/CheckoutScreen/CheckoutScreen.tsx
import { useState } from "react";
import OrderDetailsField from "../../components/Seller/OrderDetailsFields";
import AddressCard from "../../components/User/AddressCard";
import { useCartStore, CartItem } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { Seller } from "../../Types/types";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

export default function CheckoutScreen(): JSX.Element {
  const { user } = useUserStore((s) => s);
  const { cart, clearCart } = useCartStore((s) => s);
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrders, setCreatedOrders] = useState<any[] | null>(null);

  // Currency formatter (INR). Adjust locale/currency if you prefer.
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const address =
    selectedAddressIndex !== null ? user?.addresses?.[selectedAddressIndex] : null;

  // helper: normalize thumbnail -> returns full path or url or null
  const normalizeImage = (src?: string | null) => {
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src;
    return `/images/${src}`;
  };

  // unit price resolution for an item (variant > product.variants[0])
  const getUnitPrice = (item: CartItem) =>
    item.variant?.discountPrice ??
    item.variant?.originalPrice ??
    item.product?.variants?.[0]?.discountPrice ??
    item.product?.variants?.[0]?.originalPrice ??
    0;

  // total price across cart
  const totalPrice = (cart || []).reduce((acc: number, curr) => {
    const price = getUnitPrice(curr);
    return acc + curr.qty * price;
  }, 0);

  // map cart into API shape (each item includes totalPrice for that item)
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
    totalPrice,
    paymentInfo: { id: "test_payment", status: "Pending", type: "Cash on Delivery" },
  };

  async function handlePlaceOrder() {
    if (!address) {
      alert("Please select a shipping address before placing order.");
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
        // Save returned orders (optional) and clear cart
        setCreatedOrders(data.orders || null);
        clearCart();
        setSuccess(true);
      } else {
        // show message from server if available
        alert("Failed to place order: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Order error", err);
      alert("Something went wrong placing the order.");
    } finally {
      setPlacingOrder(false);
    }
  }

  // Success screen: confetti, order summary & OK -> redirect home
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        <Confetti />
        <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-lg mx-4">
          <h1 className="text-3xl font-bold text-green-600 mb-3">🎉 Order Placed Successfully!</h1>
          <p className="text-gray-700 mb-4">
            Thank you for your order. We've received it and will begin processing.
          </p>

          {/* show selected shipping address if available */}
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
              </div>
            </div>
          )}

          {/* (Optional) show created orders list */}
          {createdOrders && createdOrders.length > 0 && (
            <div className="text-left bg-white p-3 rounded-md border mb-4">
              <h4 className="font-medium mb-2">Order IDs</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {createdOrders.map((o: any) => (
                  <li key={o._id} className="truncate">
                    #{String(o._id)} — {o.shop ? `Shop: ${String(o.shop)}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

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

  // If cart empty show empty state
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
        {/* Cart Items + Address selection */}
        <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Items</h2>

          <div className="divide-y">
            {cart.map((item) => {
              const price = getUnitPrice(item);
              const variantThumb = normalizeImage(item.variant?.thumbnail ?? null);
              const productThumb = item.product?.images?.[0]
                ? `/images/${item.product.images[0]}`
                : null;
              const thumb = variantThumb ?? productThumb ?? "/placeholder.png";

              const key = item.variant ? `${item.product!._id}-${item.variant._id}` : item.product!._id;

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
                      {item.qty} × {formatter.format(price)}
                    </p>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        {item.variant.size ? `Size: ${item.variant.size}` : ""}
                        {item.variant.colorOption
                          ? ` ${item.variant.size ? "• " : ""}Color: ${item.variant.colorOption}`
                          : ""}
                      </p>
                    )}
                  </div>
                  <OrderDetailsField label="Total:" value={formatter.format(item.qty * price)} />
                </article>
              );
            })}
          </div>

          {/* Address Selection */}
          <h2 className="text-xl font-semibold mt-8 mb-4">Select Address</h2>
          {user?.addresses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.addresses.map((el: any, i: number) => (
                <article
                  key={i}
                  className={`rounded-lg cursor-pointer transition-all border p-2 ${
                    selectedAddressIndex === i
                      ? "border-yellow-500 bg-yellow-50 shadow-lg"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedAddressIndex(i)}
                >
                  <AddressCard
                    address={el}
                    name={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
                  />
                  {selectedAddressIndex === i && (
                    <div className="text-green-600 font-medium mt-1 text-sm">✓ Selected</div>
                  )}
                </article>
              ))}

              <button
                className="border border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 p-4"
                onClick={() => alert("Add address flow")}
              >
                + Add New Address
              </button>
            </div>
          ) : (
            <div className="text-gray-600">
              No saved addresses.{" "}
              <button className="text-blue-600 underline" onClick={() => alert("Add address flow")}>
                Add one now
              </button>
            </div>
          )}
        </section>

        {/* Summary Card */}
        <aside className="bg-white p-6 rounded-lg shadow h-fit sticky top-20">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>{formatter.format(totalPrice)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>{formatter.format(0)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total</span>
            <span>{formatter.format(totalPrice)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Estimated delivery: 3-5 business days</p>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-3 bg-red-500 rounded-lg text-white text-lg mt-6 disabled:bg-gray-400"
            disabled={selectedAddressIndex === null || placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </div>
    </div>
  );
}
