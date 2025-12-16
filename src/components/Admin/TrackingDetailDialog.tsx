import { FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { TruckIcon } from "lucide-react";
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

type DeliveryDetails = {
  logisticPartner: string;
  trackingNumber: string;
  pickupPerson: string;
  pickupPersonPhone: string;
};

export default function TrackingDetailDialog() {
  const [open, setOpen] = useState(false);
  const { orderId } = useParams();

  const qc = useQueryClient();
  const order = qc.getQueryData(["seller-order-detail", { orderId }]) as Order;

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    logisticPartner: "",
    trackingNumber: "",
    pickupPerson: "",
    pickupPersonPhone: "",
  });
  const [trackingFile, setTrackingFile] = useState<File | null>(null);

  useEffect(() => {
    if (order) {
      const trackingDetails = order.trackingDetails;
      setDeliveryDetails({
        logisticPartner: trackingDetails?.logisticPartner ?? "",
        trackingNumber: trackingDetails?.trackingNumber ?? "",
        pickupPerson: trackingDetails?.pickupPerson ?? "",
        pickupPersonPhone: trackingDetails?.pickupPersonPhone?.toString() ?? "",
      });
    }
  }, [order]);

  const handleChange = (field: string, value: string) => {
    setDeliveryDetails((prev) => ({ ...prev, [field]: value }));
  };

  const { mutate, status } = useMutation({
    mutationFn: (a: { data: FormData; orderId: string }) =>
      postTrackingDetails(a.data, a.orderId),
    onError: () => {
      toast.error("Something went wrong");
    },
    onSuccess: () => {
      setDeliveryDetails({
        logisticPartner: "",
        trackingNumber: "",
        pickupPerson: "",
        pickupPersonPhone: "",
      });
      setTrackingFile(null);
      qc.invalidateQueries({ queryKey: ["seller-order-detail"] });
      setOpen(false);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    if (!deliveryDetails.trackingNumber) {
      toast.warning("Please add tracking number");
      return;
    }
    if (!deliveryDetails.logisticPartner) {
      toast.warning("Please select delivery company");
      return;
    }
    const formData = new FormData();
    Object.entries(deliveryDetails).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });
    if (trackingFile) {
      formData.append("tracking_file", trackingFile);
    }
    if (status === "pending") return;

    mutate({ data: formData, orderId: orderId });
  };

  const isTrackingDocumentUploaded = order.trackingDetails?.trackingDocument;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <TruckIcon />
        </Button>
      </DialogTrigger>

      {open && (
        <DialogContent>
          <DialogHeader>Tracking Details</DialogHeader>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Delivery company</Label>
              <Select
                name="deliveryCompany"
                value={deliveryDetails.logisticPartner}
                onValueChange={(value) =>
                  handleChange("logisticPartner", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select delivery company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bluedart">Bluedart</SelectItem>
                  <SelectItem value="delhivery">Delhivery</SelectItem>
                  <SelectItem value="dtdc">DTDC</SelectItem>
                  <SelectItem value="ekart">Ekart</SelectItem>
                  <SelectItem value="xpressbees">XpressBees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tracking number</Label>
              <Input
                value={deliveryDetails.trackingNumber}
                onChange={(e) => handleChange("trackingNumber", e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>

            <div className="space-y-2">
              <Label>Pickup person</Label>
              <Input
                value={deliveryDetails.pickupPerson}
                onChange={(e) => handleChange("pickupPerson", e.target.value)}
                placeholder="Enter pickup person's name"
              />
            </div>

            <div className="space-y-2">
              <Label>Pickup person phone number</Label>
              <Input
                value={deliveryDetails.pickupPersonPhone}
                onChange={(e) =>
                  handleChange("pickupPersonPhone", e.target.value)
                }
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label>Tracking Document</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setTrackingFile(file ?? null);
                }}
              />
            </div>

            {isTrackingDocumentUploaded && (
              <div className="space-y-2">
                <iframe
                  src={BASE_URL + "payment-docs/" + isTrackingDocumentUploaded}
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" disabled={status === "pending"}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

async function postTrackingDetails(data: FormData, orderId: string) {
  const res = await fetch(
    API_URL + "order/update-tracking-details/" + orderId,
    {
      method: "PUT",
      credentials: "include",
      body: data,
    },
  );
  if (!res.ok) throw new Error();
  const result = await res.json();
  return result;
}
