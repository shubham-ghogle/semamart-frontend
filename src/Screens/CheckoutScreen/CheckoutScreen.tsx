import { useState } from "react";
import OrderDetailsField from "../../components/Seller/OrderDetailsFields";
import AddressCard from "../../components/User/AddressCard";
import { useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { Seller } from "../../Types/types";
import { useNavigate } from "react-router-dom"; 

export default function CheckoutScreen() {
  const { user } = useUserStore(state => state);
  const { cart } = useCartStore(state => state);
  const navigate = useNavigate(); // <-- instead of useRouter()

  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const address =
    selectedAddressIndex !== null ? user?.addresses[selectedAddressIndex] : null;

  const cartToApi = cart.map(el => ({
    shopId: (el.product.shopId as Seller)._id,
    _id: el.product._id,
    qty: el.qty,
  }));

  const totalPrice = cart.reduce(
    (acc, curr) => acc + curr.qty * curr.product.discountPrice,
    0
  );

  const order = {
    cart: cartToApi,
    shippingAddress: address,
    user: user?._id,
    totalPrice,
  };

  if (!cart.length) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <a href="/" className="text-blue-600 hover:underline">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div className="mt-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        {/* Cart Items */}
        <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Items</h2>
          <div className="divide-y">
            {cart.map(item => (
              <article
                key={item.product._id}
                className="flex items-center gap-4 py-4"
              >
                <img
                  src={"/image60.png"}
                  alt={item.product.name}
                  className="w-[80px] h-[80px] object-cover rounded shadow-sm"
                />
                <div className="flex-1">
                  <h5 className="text-lg font-medium">{item.product.name}</h5>
                  <p className="text-gray-600">
                    {item.qty} × {formatter.format(item.product.discountPrice)}
                  </p>
                </div>
                <OrderDetailsField
                  label="Total:"
                  value={formatter.format(item.qty * item.product.discountPrice)}
                />
              </article>
            ))}
          </div>

          {/* Address Selection */}
          <h2 className="text-xl font-semibold mt-8 mb-4">Select Address</h2>
          {user?.addresses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.addresses.map((el, i) => (
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
                    name={`${user.firstName} ${user.lastName}`}
                  />
                  {selectedAddressIndex === i && (
                    <div className="text-green-600 font-medium mt-1 text-sm">
                      ✓ Selected
                    </div>
                  )}
                </article>
              ))}
              <button
                className="border border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
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
          <p className="text-sm text-gray-500 mt-2">
            Estimated delivery: 3–5 business days
          </p>

          {/* Proceed Button */}
          <button
            onClick={() =>
              navigate(
                `/checkout/payment?order=${encodeURIComponent(
                  JSON.stringify(order)
                )}`
              )
            }
            className="w-full py-3 bg-red-500 rounded-lg text-white text-lg mt-6 disabled:bg-gray-400"
            disabled={selectedAddressIndex === null}
          >
            {selectedAddressIndex !== null
              ? "Proceed to Payment"
              : "Select Address to Continue"}
          </button>
        </aside>
      </div>
    </div>
  );
}
