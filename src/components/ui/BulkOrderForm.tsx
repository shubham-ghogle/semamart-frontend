import { useState } from "react";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/userStore";
import { API_URL } from "@/data";

type BulkOrderFormProps = {
  open: boolean;
  onClose: () => void;
  product: {
    _id: string;
    name: string;
  };
  price: number;
  variantId: string;
};

export default function BulkOrderForm({
  open,
  onClose,
  product,
  price,
  variantId,
}: BulkOrderFormProps) {
  const [qty, setQty] = useState<string>("");
  const [customerPrice, setCustomerPrice] = useState<string>(""); // NEW
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const user = useUserStore((state) => state.user);

  if (!open) return null;

  const handleSubmit = async () => {
    const quantity = Number(qty);
    const proposedPrice = Number(customerPrice);

    if (!quantity || quantity < 1) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    if (customerPrice && (isNaN(proposedPrice) || proposedPrice <= 0)) {
      toast.error("Please enter a valid proposed price.");
      return;
    }

    const payload = {
      userId: user?._id,
      productId: product._id,
      variantId: variantId || null,
      unitPrice: price,
      quantity,
      comment,
      customerPrice: proposedPrice || null, // include customer price
    };

    try {
      setLoading(true);

      const res = await fetch(API_URL + "bulkorder/bulk-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit bulk order request.");
      }

      toast.success(
        "Your bulk order request has been submitted successfully. Our team will contact you shortly."
      );

      setQty("");
      setCustomerPrice(""); // clear input
      setComment("");
      onClose();
    } catch (err: any) {
      console.error("Error:", err.message);
      toast.error(
        err.message || "Unable to submit bulk order request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-semibold">Bulk Order Request</h2>

        {/* Institute Name */}
        <div>
          <label className="text-sm text-gray-600">Institute Name</label>
          <input
            value={user?.firstName ?? ""}
            disabled
            className="w-full border rounded-lg p-2 bg-gray-100"
          />
        </div>

        {/* Product Name */}
        <div>
          <label className="text-sm text-gray-600">Product Name</label>
          <input
            value={product.name}
            disabled
            className="w-full border rounded-lg p-2 bg-gray-100"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-sm text-gray-600">Price (per unit)</label>
          <input
            value={`₹${price.toLocaleString("en-IN")}`}
            disabled
            className="w-full border rounded-lg p-2 bg-gray-100"
          />
        </div>

        {/* Customer Proposed Price */}
        <div>
          <label className="text-sm text-gray-600">Your Proposed Price (optional)</label>
          <input
            type="number"
            min={1}
            value={customerPrice}
            onChange={(e) => {
              const cleanedValue = e.target.value.replace(/^0+/, "");
              setCustomerPrice(cleanedValue);
            }}
            className="w-full border rounded-lg p-2"
            placeholder="Enter your proposed price"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="text-sm text-gray-600">Quantity</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => {
              const cleanedValue = e.target.value.replace(/^0+/, "");
              setQty(cleanedValue);
            }}
            className="w-full border rounded-lg p-2"
            placeholder="Enter quantity"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="text-sm text-gray-600">Comment</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="Any special requirements..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-2"
          >
            Cancel
          </button>

          <button
            disabled={Number(qty) < 1 || loading}
            onClick={handleSubmit}
            className="flex-1 bg-[#1C647C] text-white rounded-xl py-2 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
