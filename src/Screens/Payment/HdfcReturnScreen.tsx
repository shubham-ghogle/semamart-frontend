import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "@/data";

type ConfirmResponse = {
  success: boolean;
  status?: string;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  message?: string;
};

export default function HdfcReturnScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConfirmResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderIdParam =
      params.get("order_id") ||
      params.get("orderId") ||
      params.get("order");

    const storedGroupId = localStorage.getItem("hdfc_payment_group_id");
    const groupId = orderIdParam || storedGroupId;

    if (!groupId) {
      setError("Missing payment reference.");
      setLoading(false);
      return;
    }

    async function confirm() {
      try {
        const res = await fetch(
          API_URL + "order/order-confirmation/" + groupId,
        );
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to confirm payment");
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to confirm payment");
      } finally {
        setLoading(false);
        if (storedGroupId) localStorage.removeItem("hdfc_payment_group_id");
      }
    }

    confirm();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 text-center">
        <h1 className="text-2xl font-semibold mb-3">Payment Status</h1>

        {loading && <p>Checking payment status...</p>}

        {!loading && error && (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              className="px-4 py-2 bg-gray-800 text-white rounded"
              onClick={() => navigate("/account/orders")}
            >
              Go to Orders
            </button>
          </>
        )}

        {!loading && !error && data && (
          <>
            <p className="mb-2">
              <strong>Order ID:</strong> {data.orderId}
            </p>
            <p className="mb-2">
              <strong>Amount:</strong>{" "}
              {typeof data.amount === "number"
                ? data.amount.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })
                : "—"}
            </p>
            <p className="mb-4">
              <strong>Status:</strong>{" "}
              {data.status === "CHARGED" ? "Success" : data.status || "Unknown"}
            </p>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => navigate("/account/orders")}
            >
              View Orders
            </button>
          </>
        )}
      </div>
    </div>
  );
}
