import { FormEvent, useState } from "react";
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
import { useMutation } from "@tanstack/react-query";
import { API_URL } from "@/data";
import { useParams } from "react-router";
import { toast } from "react-toastify";

export default function TrackingDetailDialog() {
  const [open, setOpen] = useState(false);
  const { orderId } = useParams();

  const [deliveryDetails, setDeliveryDetails] = useState({
    logisticPartner: "",
    trackingNumber: "",
    pickupPerson: "",
    pickupPersonPhone: "",
  });

  const handleChange = (field: string, value: string) => {
    setDeliveryDetails((prev) => ({ ...prev, [field]: value }));
  };

  async function postTrackingDetails(data: any) {
    const res = await fetch(
      API_URL + "order/update-tracking-details/" + orderId,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials:"include",
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) throw new Error();
    const result = await res.json();
    return result;
  }

  const { mutate, status } = useMutation({
    mutationFn: (data: any) => postTrackingDetails(data),
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

      setOpen(false);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if(status==="pending") return
    mutate(deliveryDetails);
  };

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
                required
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
                required
                value={deliveryDetails.trackingNumber}
                onChange={(e) => handleChange("trackingNumber", e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>

            <div className="space-y-2">
              <Label>Pickup person</Label>
              <Input
                required
                value={deliveryDetails.pickupPerson}
                onChange={(e) => handleChange("pickupPerson", e.target.value)}
                placeholder="Enter pickup person's name"
              />
            </div>

            <div className="space-y-2">
              <Label>Pickup person phone number</Label>
              <Input
                required
                value={deliveryDetails.pickupPersonPhone}
                onChange={(e) =>
                  handleChange("pickupPersonPhone", e.target.value)
                }
                placeholder="Enter phone number"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" disabled={status==="pending"}>Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
