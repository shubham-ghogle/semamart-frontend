import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Clipboard } from "lucide-react"; 

type CommissionHistoryDialogProps = {
  history: { updatedAt: string; commission: number }[];
};

export default function DisplayCommission({ history }: CommissionHistoryDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log("Commission History received:", history);
  }, [history]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <Clipboard size={16} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Commission History</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {history.length === 0 ? (
              <p>No history available.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 border-b pb-1 font-semibold">
                <span>Date</span>
                <span>Old</span>
                <span>New</span>
              </div>
            )}

            {history.map((h, index) => {
              const oldCommission = index === 0 ? "-" : history[index - 1].commission;
              const newCommission = h.commission;

              return (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 border-b py-1"
                >
                  <span>{new Date(h.updatedAt).toLocaleDateString("en-IN")}</span>
                  <span>{oldCommission}</span>
                  <span>{newCommission}</span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
