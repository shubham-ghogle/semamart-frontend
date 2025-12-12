import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BASE_URL } from "@/data";
import { useAdminOrderMutation } from "@/Screens/Admin/Admin.HooksAndUtils";
import { useParams } from "react-router";
import { Order } from "@/Types/types";

type AdminPaymentProofDialogProps = {
  paymentData: string | null;
  currentStatus: Order["status"];
};
export default function OrderPaymentViewDialog({
  paymentData,
  currentStatus,
}: AdminPaymentProofDialogProps) {
  const [open, setOpen] = useState(false);

  const isPDF = paymentData?.toLowerCase().endsWith(".pdf");

  const { mutationStatus, mutateOrder } = useAdminOrderMutation(() => {
    setOpen(false);
  });

  const { orderId } = useParams();

  const isPaymentVerified = currentStatus !== "Paid";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Payment Proof
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Proof Details</DialogTitle>
          </DialogHeader>

          {/* Uploaded File Preview */}
          <div className="mt-4 border rounded-xl p-4 flex justify-center bg-muted/20">
            {!paymentData ? (
              <p className="text-muted-foreground">No file uploaded</p>
            ) : isPDF ? (
              <iframe
                src={BASE_URL + "payment-docs/" + paymentData}
                className="w-full h-[500px] rounded-md border"
              />
            ) : (
              <img
                src={BASE_URL + "images/" + paymentData}
                alt="Payment Proof"
                className="max-h-[500px] rounded-md border object-contain"
              />
            )}
          </div>

          <DialogFooter>
            {!isPaymentVerified && (
              <Button
                onClick={() => {
                  mutateOrder({ orderId: orderId ?? "", status: "Processing" });
                }}
                disabled={mutationStatus === "pending"}
              >
                Verify
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
