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

export default function MakePaymentDialog() {
  const [open, setOpen] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("nian");
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

          <section>todo: paymeny methods</section>
          <form onSubmit={(e) => onSubmit(e)}>
            <Input type="file" accept="image/*,application/pdf" />
            <Button>Submit</Button>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
