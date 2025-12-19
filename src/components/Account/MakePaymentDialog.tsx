import { FormEvent, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
// import { Input } from "../ui/input";
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

  const { mutate: mutateOrder, isPending } = useMutation({
    mutationFn: async (file: File | null) => {
      if (!file) throw new Error("Add payment file");

      const formData = new FormData();
      formData.append("payment_file", file);

      const res = await fetch(API_URL + "order/update-order-payment/" + orderId, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutateOrder(paymentFile);
  }

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Make Payment
        </Button>
      </DialogTrigger>

      {open && (
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] p-3 sm:p-4 flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm">Make Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm overflow-y-auto flex-1">
            <form onSubmit={onSubmit} className="mt-2">
              <div className="flex items-center space-x-2">
                {/* File Upload */}
                {!paymentFile ? (
                  <label className="flex-1 flex items-center justify-center border rounded-md p-2 text-xs cursor-pointer">
                    <span>Upload Payment File</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setPaymentFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                ) : (
                  <div className="flex-1 flex items-center justify-between border rounded-md p-2 text-xs">
                    <span className="truncate">{paymentFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                    >
                      <FiX className="w-2 h-2" />
                    </Button>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs"
                  disabled={!paymentFile || isPending}
                >
                  {isPending ? "Submitting..." : "Submit Payment"}
                </Button>
              </div>
            </form>


            {/* UPI Section */}
            <div className="p-2 border rounded-lg bg-muted/30">
              <h3 className="font-semibold mb-2 text-sm">UPI Payment</h3>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs break-all">
                    <span className="text-muted-foreground">UPI ID</span>
                    <br />
                    MAB0450978A0216504@yesbank
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1 px-2 py-1 text-xs"
                    onClick={() =>
                      navigator.clipboard.writeText("MAB0450978A0216504@yesbank")
                    }
                  >
                    Copy
                  </Button>
                </div>
                <img
                  src="/qr_payment.jpeg"
                  alt="UPI QR Code"
                  className="w-16 h-16 sm:w-20 sm:h-20 border rounded-md"
                />
              </div>
            </div>

            {/* Bank Transfers */}
            {[
              {
                name: "YES BANK",
                accountName: "Sema Healthcare Pvt Ltd",
                accountNumber: "97863700000408",
                ifsc: "YESB0000978",
              },
              {
                name: "HDFC BANK",
                accountName: "SEMA HEALTHCARE PVT LTD",
                accountNumber: "50200080159582",
                ifsc: "HDFC0001718",
              },
            ].map((bank) => (
              <div key={bank.name} className="p-2 border rounded-lg text-xs">
                <h3 className="font-semibold mb-1">{bank.name} Transfer</h3>
                <ul className="space-y-1">
                  <li>
                    <strong>Account Name:</strong> {bank.accountName}
                  </li>
                  <li>
                    <strong>A/C Number:</strong> {bank.accountNumber}
                  </li>
                  <li>
                    <strong>IFSC:</strong> {bank.ifsc}
                  </li>
                </ul>
              </div>
            ))}

            {/* Payment Proof Upload */}
            
</div>
        </DialogContent>
      )}
    </Dialog>
  );
}
