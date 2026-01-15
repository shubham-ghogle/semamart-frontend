// components/ui/NotifyMeToast.tsx
import { useState } from "react";
import { AiOutlineCheckCircle, AiOutlineBell } from "react-icons/ai";

interface NotifyMeToastProps {
  product: any;
  variant: any;
  user: any;
  onClose: () => void;
  onSubmit: (
    email: string,
    user_id: string,
    variant_id?: string
  ) => Promise<{ success: boolean; alreadyExists?: boolean; message: string }>;
}

export default function NotifyMeToast({
  product,
  variant,
  user,
  onClose,
  onSubmit,
}: NotifyMeToastProps) {
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    setSuccess(false);
    setAlreadyExists(false);

    try {
      const response = await onSubmit(email, user?._id, variant?._id);
      setLoading(false);

      if (response.success) {
        if (response.alreadyExists) {
          setAlreadyExists(true);
        } else {
          setSuccess(true);
        }
        setTimeout(onClose, 7000);
      } else {
        alert(response.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed top-2 w-full max-w-sm bg-white rounded-2xl shadow-xl border px-4 py-5 z-50 animate-slide-up">
      {success ? (
        <div className="flex items-center gap-3">
          <AiOutlineCheckCircle className="text-green-500 text-3xl" />
          <div>
            <p className="font-semibold">You’re all set!</p>
            <p className="text-sm text-gray-600">
              We’ll notify you when it’s back in stock.
            </p>
          </div>
        </div>
      ) : alreadyExists ? (
        <div className="flex items-center gap-3">
          <AiOutlineCheckCircle className="text-yellow-500 text-3xl" />
          <div>
            <p className="font-semibold">Notification already exists</p>
            <p className="text-sm text-gray-600">
              You will be notified for this product when it’s back in stock.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <AiOutlineBell className="text-orange-500 text-xl" />
            <p className="font-semibold text-sm">Notify me when available</p>
          </div>
          <p className="text-xs text-gray-500 mb-3 line-clamp-1">{product.name}</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleSubmit}
              disabled={!email || loading}
              className="bg-orange-500 text-white px-4 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "..." : "Notify"}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 rounded-lg text-sm font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
