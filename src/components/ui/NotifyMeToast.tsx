import { useState, useEffect, useRef } from "react";
import {
  AiOutlineCheckCircle,
  AiOutlineWarning,
} from "react-icons/ai";

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

type ToastStatus = "success" | "exists" | "no-email" | null;

export default function NotifyMeToast({
  variant,
  user,
  onClose,
  onSubmit,
}: NotifyMeToastProps) {
  const [status, setStatus] = useState<ToastStatus>(null);
  const hasSubmitted = useRef(false);

  const email = user?.email;

  const handleSubmit = async () => {
    if (!email) {
      setStatus("no-email");
      return;
    }

    try {
      const response = await onSubmit(email, user?._id, variant?._id);

      if (response.success) {
        setStatus(response.alreadyExists ? "exists" : "success");
        setTimeout(onClose, 7000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 🔥 AUTO-SUBMIT ON MOUNT
  useEffect(() => {
    if (!user?._id || hasSubmitted.current) return;

    hasSubmitted.current = true;
    handleSubmit();
  }, [user]);

  if (!status) return null;

  return (
    <div className="fixed top-2 w-full max-w-sm bg-white rounded-2xl shadow-xl border px-4 py-5 z-50 animate-slide-up">
      {status === "success" && (
        <div className="flex items-center gap-3">
          <AiOutlineCheckCircle className="text-green-500 text-3xl" />
          <div>
            <p className="font-semibold">You’re all set!</p>
            <p className="text-sm text-gray-600">
              We’ll notify you when it’s back in stock.
            </p>
          </div>
        </div>
      )}

      {status === "exists" && (
        <div className="flex items-center gap-3">
          <AiOutlineCheckCircle className="text-yellow-500 text-3xl" />
          <div>
            <p className="font-semibold">Already subscribed</p>
            <p className="text-sm text-gray-600">
              You’ll be notified when it’s back in stock.
            </p>
          </div>
        </div>
      )}

      {status === "no-email" && (
        <div className="flex items-center gap-3">
          <AiOutlineWarning className="text-red-500 text-3xl" />
          <div>
            <p className="font-semibold">Email required</p>
            <p className="text-sm text-gray-600">
              Please add an email to your account to receive notifications.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
