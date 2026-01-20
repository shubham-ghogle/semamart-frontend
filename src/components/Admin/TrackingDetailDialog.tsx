import { FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL, BASE_URL } from "@/data";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { Order } from "@/Types/types";

/* -------------------------------- TYPES -------------------------------- */

type DeliveryDetails = {
  logisticPartner: string;
  trackingNumber: string;
  pickupPerson: string;
  pickupPersonPhone: string;
};

type TrackingDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/* ---------------------------- COMPONENT --------------------------------- */

export default function TrackingDetailDialog({
  open,
  onOpenChange,
}: TrackingDetailDialogProps) {
  const { orderId } = useParams();
  const queryClient = useQueryClient();

  const order = queryClient.getQueryData<Order>([
    "seller-order-detail",
    { orderId },
  ]);

  const [deliveryDetails, setDeliveryDetails] =
    useState<DeliveryDetails>({
      logisticPartner: "",
      trackingNumber: "",
      pickupPerson: "",
      pickupPersonPhone: "",
    });

  const [trackingFile, setTrackingFile] = useState<File | null>(null);

  /* ------------------------ PREFILL DATA ------------------------ */

  useEffect(() => {
    if (order?.trackingDetails) {
      setDeliveryDetails({
        logisticPartner: String(
          order.trackingDetails.logisticPartner ?? ""
        ),
        trackingNumber: String(
          order.trackingDetails.trackingNumber ?? ""
        ),
        pickupPerson: String(
          order.trackingDetails.pickupPerson ?? ""
        ),
        pickupPersonPhone: String(
          order.trackingDetails.pickupPersonPhone ?? ""
        ),
      });
    }
  }, [order]);

  const handleChange = (
    field: keyof DeliveryDetails,
    value: string
  ) => {
    setDeliveryDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* --------------------------- MUTATION --------------------------- */

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      data,
      orderId,
    }: {
      data: FormData;
      orderId: string;
    }) => postTrackingDetails(data, orderId),
    onSuccess: () => {
      toast.success("Tracking details saved");
      queryClient.invalidateQueries({
        queryKey: ["seller-order-detail", { orderId }],
      });
      setTrackingFile(null);
      onOpenChange(false); // ✅ CLOSE ONLY AFTER SUBMIT
    },
    onError: () => {
      toast.error("Failed to save tracking details");
    },
  });

  /* --------------------------- SUBMIT --------------------------- */

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!orderId) return;

    const {
      logisticPartner,
      trackingNumber,
      pickupPerson,
      pickupPersonPhone,
    } = deliveryDetails;

    // ✅ ALL FIELDS REQUIRED
    if (
      !logisticPartner.trim() ||
      !trackingNumber.trim() ||
      !pickupPerson.trim() ||
      !pickupPersonPhone.trim()
    ) {
      toast.warning("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("logisticPartner", logisticPartner);
    formData.append("trackingNumber", trackingNumber);
    formData.append("pickupPerson", pickupPerson);
    formData.append("pickupPersonPhone", pickupPersonPhone);

    if (trackingFile) {
      formData.append("tracking_file", trackingFile);
    }

    mutate({ data: formData, orderId });
  };

  const trackingDoc =
    order?.trackingDetails?.trackingDocument;

  /* ----------------------------- UI ----------------------------- */

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>Tracking Details</DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Delivery Company *</Label>
            <Select
              value={deliveryDetails.logisticPartner}
              onValueChange={(v) =>
                handleChange("logisticPartner", String(v))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bluedart">Bluedart</SelectItem>
                <SelectItem value="delhivery">Delhivery</SelectItem>
                <SelectItem value="dtdc">DTDC</SelectItem>
                <SelectItem value="ekart">Ekart</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tracking Number *</Label>
            <Input
              value={deliveryDetails.trackingNumber}
              onChange={(e) =>
                handleChange(
                  "trackingNumber",
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <Label>Pickup Person *</Label>
            <Input
              value={deliveryDetails.pickupPerson}
              onChange={(e) =>
                handleChange(
                  "pickupPerson",
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <Label>Pickup Phone *</Label>
            <Input
              type="tel"
              value={deliveryDetails.pickupPersonPhone}
              onChange={(e) =>
                handleChange(
                  "pickupPersonPhone",
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <Label>Tracking Document *</Label>
            <Input
              type="file"
              required
              accept=".pdf,.jpg,.png"
              onChange={(e) =>
                setTrackingFile(
                  e.target.files?.[0] ?? null
                )
              }
            />
          </div>

          {trackingDoc && (
            <iframe
              className="w-full h-40 border rounded"
              src={
                BASE_URL + "payment-docs/" + trackingDoc
              }
              title="Tracking Document"
              
            />
          )}

          <DialogFooter>
            <Button disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- API --------------------------- */

async function postTrackingDetails(
  data: FormData,
  orderId: string
) {
  const res = await fetch(
    API_URL + "order/update-tracking-details/" + orderId,
    {
      method: "PUT",
      credentials: "include",
      body: data,
    }
  );

  if (!res.ok) {
    throw new Error("Failed to save tracking details");
  }

  return res.json();
}
