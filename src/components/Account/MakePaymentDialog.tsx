import { FormEvent, useState } from "react";
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

type MakePaymentDialogProps = {
  orderId: string;
};

export default function MakePaymentDialog({ orderId }: MakePaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const[paymentFile,setPaymentFile] = useState<File|null>(null)

  const qc = useQueryClient()

  const { mutate: mutateOrder } = useMutation({
    mutationFn: async function addOrderPayment(file:File|null) {
      if(!file) throw new Error("Add payment file")
      const formData = new FormData()
      formData.append("payment_file",file)
      const res = await fetch(
        API_URL + "order/update-order-payment/" + orderId,{
        method:"PUT",
        credentials:"include",
        body:formData
        }
      );
      if (!res.ok) throw new Error("Could not add payment file");
    },
    onError:(err)=>{
      toast.error(err.message)
    },
    onSuccess:()=>{
      qc.invalidateQueries({queryKey:["user-orders"]})
      setOpen(false)
    }
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutateOrder(paymentFile)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Make Payment
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">

              {/* UPI Section */}
              <div className="p-4 border rounded-xl bg-muted/30">
                <h3 className="font-semibold mb-2">UPI Payment</h3>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground">UPI ID:</span><br />
                    MAB0450978A0216504@yesbank
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText("MAB0450978A0216504@yesbank")
                    }
                  >
                    Copy
                  </Button>
                </div>

                {/* QR Code */}
                <div className="mt-4 flex justify-center">
                  <img
                    src="/qr_payment.jpeg"
                    alt="UPI QR Code"
                    className="w-40 h-40 border rounded-lg"
                  />
                </div>
              </div>

              {/* Yes Bank */}
              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold mb-2">Bank Transfer (YES BANK)</h3>
                <ul className="text-sm space-y-1">
                  <li><strong>Bank Name:</strong> YES BANK</li>
                  <li><strong>Account Name:</strong> Sema Healthcare Private Limited</li>
                  <li><strong>A/C Number:</strong> 97863700000408</li>
                  <li><strong>IFSC:</strong> YESB0000978</li>
                </ul>
              </div>

              {/* HDFC */}
              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold mb-2">Bank Transfer (HDFC BANK)</h3>
                <ul className="text-sm space-y-1">
                  <li><strong>Bank Name:</strong> HDFC BANK</li>
                  <li><strong>Account Name:</strong> SEMA HEALTHCARE PVT LTD</li>
                  <li><strong>A/C Number:</strong> 50200080159582</li>
                  <li><strong>IFSC:</strong> HDFC0001718</li>
                </ul>
              </div>
            </div>

          <form onSubmit={(e) => onSubmit(e)} className="space-y-6">
            <Input type="file" accept="image/*,application/pdf" onChange={(e)=>setPaymentFile(e.target.files?.[0]??null)} />
            <Button>Submit</Button>
          </form>

        </DialogContent>
      )}
    </Dialog>
  );
}
