import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FaRupeeSign } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/data";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

type UpdateCommissionDialogProps = {
  currentCommission: number;
  productId: string;
  variantId: string;
};
export default function UpdateCommissionDialog({
  currentCommission,
  productId,
  variantId,
}: UpdateCommissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [newCommission, setNewCommission] = useState(
    currentCommission.toString(),
  );

  const qc = useQueryClient();

  useEffect(() => {
    if (open) {
      setNewCommission(currentCommission.toString());
    }
  }, [currentCommission, open]);

  async function updateCommissionAmount(comm: number, varId: string) {
    const res = await fetch(
      API_URL + "product-variant/update-commission/" + varId,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ commission: comm }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || "Unable to update commission amount");
    }
    return data;
  }

  const { mutate, status } = useMutation({
    mutationFn: (v: { newCommission: number; variantId: string }) => {
      return updateCommissionAmount(v.newCommission, v.variantId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-products"] });
      await qc.invalidateQueries({ queryKey: ["product", productId] });
      await qc.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Commission amount updated");
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Unable to update commission amount");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <FaRupeeSign />
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Commission Amount</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium">Current Commission Amount</Label>
              <Input value={currentCommission} disabled readOnly />
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium">New Commission Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
                placeholder="Enter new commission amount"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                if (newCommission.trim() === "" || Number.isNaN(Number(newCommission))) {
                  toast.error("Please enter a valid commission amount");
                  return;
                }
                mutate({
                  newCommission: Number(newCommission),
                  variantId,
                });
              }}
              disabled={status === "pending"}
            >
              {status === "pending" ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
