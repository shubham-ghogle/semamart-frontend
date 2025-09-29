import { useState } from "react";
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

export default function TrackingDetailDialog() {
  const [open, setOpen] = useState(false);

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
          <div className="space-y-2">
            <Label>Delivery company</Label>
            <Select name="deliveryCompany">
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
            <Label>Tracking number</Label>
            <Input />
            <DialogFooter>
              <Button variant="outline">Ok</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
