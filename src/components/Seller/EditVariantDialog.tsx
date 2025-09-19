import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

export default function EditVariantDialog() {
  const [open, setOpen] = useState(false);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>click</Button>
      </DialogTrigger>
      {open && (
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Edit Product Variant</DialogTitle>
            </DialogHeader>
        </DialogContent>
      )}
    </Dialog>
  );
}
