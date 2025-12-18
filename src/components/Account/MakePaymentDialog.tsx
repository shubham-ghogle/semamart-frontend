import { FormEvent, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/data";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";

type MakePaymentDialogProps = {
  orderId: string;
};

export default function MakePaymentDialog({ orderId }: MakePaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const qc = useQueryClient();

  const { mutate: mutateOrder } = useMutation({
    mutationFn: async (file: File | null) => {
      if (!file) throw new Error("Add payment file");

      const formData = new FormData();
      formData.append("payment_file", file);

      const res = await fetch(
        API_URL + "order/update-order-payment/" + orderId,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Could not add payment file");
    },
    onError: (err: any) => toast.error(err.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-orders"] });
      setOpen(false);
      clearFile();
    },
  });

  function clearFile() {
    setPaymentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutateOrder(paymentFile);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Make Payment
        </Button>
      </DialogTrigger>

      {open && (
        <DialogContent
          className="
            w-[95vw]
            max-w-lg
            sm:max-w-xl
            max-h-[92vh]
            sm:max-h-[88vh]
            p-3
            sm:p-4
          "
        >
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>

          {/* ================= PAYMENT DETAILS ================= */}
          <div className="space-y-3 text-sm">
            {/* UPI SECTION */}
            <div className="p-3 border rounded-lg bg-muted/30">
              <h3 className="font-semibold mb-1">UPI Payment</h3>

              <div className="flex items-center justify-between gap-2">
                <p className="text-xs break-all">
                  <span className="text-muted-foreground">UPI ID</span>
                  <br />
                  MAB0450978A0216504@yesbank
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      "MAB0450978A0216504@yesbank"
                    )
                  }
                >
                  Copy
                </Button>
              </div>

              <div className="mt-3 flex justify-center">
                <img
                  src="/qr_payment.jpeg"
                  alt="UPI QR Code"
                  className="w-32 h-32 sm:w-36 sm:h-36 border rounded-md"
                />
              </div>
            </div>

            {/* YES BANK */}
            <div className="p-3 border rounded-lg">
              <h3 className="font-semibold mb-1">Bank Transfer (YES BANK)</h3>
              <ul className="text-xs space-y-1">
                <li><strong>Account Name:</strong> Sema Healthcare Pvt Ltd</li>
                <li><strong>A/C Number:</strong> 97863700000408</li>
                <li><strong>IFSC:</strong> YESB0000978</li>
              </ul>
            </div>

            {/* HDFC BANK */}
            <div className="p-3 border rounded-lg">
              <h3 className="font-semibold mb-1">Bank Transfer (HDFC BANK)</h3>
              <ul className="text-xs space-y-1">
                <li><strong>Account Name:</strong> SEMA HEALTHCARE PVT LTD</li>
                <li><strong>A/C Number:</strong> 50200080159582</li>
                <li><strong>IFSC:</strong> HDFC0001718</li>
              </ul>
            </div>
          </div>

          {/* ================= UPLOAD PAYMENT PROOF ================= */}
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            {!paymentFile ? (
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) =>
                  setPaymentFile(e.target.files?.[0] ?? null)
                }
              />
            ) : (
              <div className="flex items-center justify-between border rounded-md p-2">
                <span className="text-xs truncate">
                  {paymentFile.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                >
                  <FiX className="w-4 h-4" />
                </Button>
              </div>
            )}

            <Button
              size="sm"
              className="w-full"
              disabled={!paymentFile}
            >
              Submit Payment
            </Button>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
