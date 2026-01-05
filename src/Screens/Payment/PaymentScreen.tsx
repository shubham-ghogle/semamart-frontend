import { useLocation } from "react-router-dom";
import { useState } from "react";
import { API_URL } from "@/data";

export default function PaymentScreen() {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  //const navigate = useNavigate();
  const location = useLocation();

  // Parse order from query string
  const searchParams = new URLSearchParams(location.search);
  const orderParam = searchParams.get("order");
  const order = orderParam ? JSON.parse(orderParam) : null;

  async function placeOrder() {
    if (!order) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL+"order/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...order,
          paymentInfo: {
            id: "test_payment",
            status: "Pending",
            type:
              paymentMethod === "cod"
                ? "Cash on Delivery"
                : paymentMethod.toUpperCase(),
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to place order");

      alert("Order placed successfully!");
      //navigate("/orders"); // redirect to orders page
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Choose Payment Method</h2>
        {/* payment options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:border-yellow-500">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            <span>Cash on Delivery</span>
          </label>
          <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:border-yellow-500">
            <input
              type="radio"
              name="payment"
              value="gpay"
              checked={paymentMethod === "gpay"}
              onChange={() => setPaymentMethod("gpay")}
            />
            <span>Google Pay</span>
          </label>
          <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:border-yellow-500">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            <span>Credit / Debit Card</span>
          </label>
        </div>

        {/* Place order */}
        <button
          onClick={placeOrder}
          className="w-full py-3 bg-red-500 rounded-lg text-white text-lg mt-6 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
