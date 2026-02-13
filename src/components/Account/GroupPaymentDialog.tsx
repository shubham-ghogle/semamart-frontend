import { FormEvent, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import { API_URL } from "@/data";
import { Order, Product, Variant } from "@/Types/types";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type GroupPaymentDialogProps = {
  orders: Order[];
};

export default function GroupPaymentDialog({ orders }: GroupPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Manual" | "HDFC">("HDFC");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const qc = useQueryClient();

  const payableOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === "Created" ||
          (o.status === "Paid" && o.paymentInfo?.status === "Failed"),
      ),
    [orders],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected =
    payableOrders.length > 0 && selectedIds.length === payableOrders.length;

  const selectedOrders = payableOrders.filter((o) => selectedIds.includes(o._id));
  const selectedTotal = selectedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(payableOrders.map((o) => o._id));
  };

  const toggleOrder = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const clearFile = () => {
    setPaymentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startHdfcPayment = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one order");
      return;
    }

    setIsRedirecting(true);
    try {
      const res = await fetch(API_URL + "order/create-payment-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start payment");
      if (data.paymentGroupId) {
        localStorage.setItem("hdfc_payment_group_id", data.paymentGroupId);
      }
      window.location.href = data.paymentLink;
    } catch (err: any) {
      toast.error(err.message || "Failed to start payment");
      setIsRedirecting(false);
    }
  };

  const { mutate: uploadManualPayment, isPending } = useMutation({
    mutationFn: async (file: File | null) => {
      if (!file) throw new Error("Add payment file");
      if (selectedIds.length === 0) throw new Error("Select at least one order");

      const formData = new FormData();
      formData.append("payment_file", file);
      formData.append("orderIds", JSON.stringify(selectedIds));

      const res = await fetch(API_URL + "order/update-order-payment-bulk", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not add payment file");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-orders"] });
      setOpen(false);
      setSelectedIds([]);
      clearFile();
      toast.success("Payment proof submitted");
    },
    onError: (err: any) => toast.error(err.message || "Payment failed"),
  });

  const onManualSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    uploadManualPayment(paymentFile);
  };

  const getProductName = (order: Order) => {
    const variant = order.variant as Variant;
    const product = variant?.productId as Product;
    return product?.name || order._id;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) setSelectedIds(payableOrders.map((o) => o._id));
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Make Payment
        </Button>
      </DialogTrigger>

      {open && (
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-4 flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base">Pay Group Orders</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 overflow-y-auto flex-1">
            <div className="rounded-md border p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Select products to pay</p>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {allSelected ? "Unselect all" : "Select all"}
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-auto">
                {payableOrders.map((order) => (
                  <label
                    key={order._id}
                    className="flex items-start gap-2 border rounded p-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order._id)}
                      onChange={() => toggleOrder(order._id)}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getProductName(order)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Order: {order._id} | Amount: ₹
                        {(order.totalPrice || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <p className="mt-2 text-sm font-semibold">
                Selected Total: ₹{selectedTotal.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="group-payment-method"
                  checked={paymentMethod === "HDFC"}
                  onChange={() => setPaymentMethod("HDFC")}
                />
                <span>Pay Online (HDFC)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="group-payment-method"
                  checked={paymentMethod === "Manual"}
                  onChange={() => setPaymentMethod("Manual")}
                />
                <span>Pay Manual (Upload Payment Proof)</span>
              </label>
            </div>

            {paymentMethod === "HDFC" ? (
              <Button
                type="button"
                size="sm"
                disabled={isRedirecting || selectedIds.length === 0}
                onClick={startHdfcPayment}
              >
                {isRedirecting ? "Redirecting..." : "Proceed to HDFC"}
              </Button>
            ) : (
              <form onSubmit={onManualSubmit} className="space-y-2">
                <div className="flex items-center gap-2">
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
                      <Button type="button" variant="ghost" size="icon" onClick={clearFile}>
                        <FiX className="w-2 h-2" />
                      </Button>
                    </div>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!paymentFile || isPending || selectedIds.length === 0}
                  >
                    {isPending ? "Submitting..." : "Submit Payment"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
