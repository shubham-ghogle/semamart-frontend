import { useState } from "react";
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
import { Clipboard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/data";
import { toast } from "react-toastify";
import { useParams } from "react-router";

type UpdateCommissionDialogProps = {
  currentCommission: number;
  productId: string;
};
export default function UpdateCommissionDialog({
  currentCommission,
  productId,
}: UpdateCommissionDialogProps) {
  const { sellerId } = useParams();

  const [open, setOpen] = useState(false);
  const [newCommission, setNewCommission] = useState(0);

  const qc = useQueryClient();

  async function updateCommison(comm: number, proId: string) {
    const res = await fetch(API_URL + "product/update-commission/" + proId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ commission: comm }),
    });
    if (!res.ok) throw new Error();
    return res.json();
  }

  const { mutate, status } = useMutation({
    mutationFn: (v: { newCommission: number; proId: string }) => {
      return updateCommison(v.newCommission, v.proId);
    },
    onSuccess: async() => {
      await qc.invalidateQueries({ queryKey: ["seller-products", sellerId] });
      setOpen(false);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Clipboard />
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Commission</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium">Old Commission Amount</Label>
              <Input value={currentCommission} disabled readOnly />
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium">New Commission Amount</Label>
              <Input
                type="number"
                value={newCommission}
                onChange={(e) => setNewCommission(Number(e.target.value))}
                placeholder="Enter new commission"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() =>
                mutate({ newCommission: newCommission, proId: productId })
              }
              disabled={status === "pending"}
            >
              {status === "pending" ? "Loading..." : "Ok"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
