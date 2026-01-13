import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { History } from "lucide-react";

type CommissionHistory = {
  updatedAt: string;
  commission: number;
};

type CommissionHistoryDialogProps = {
  history?: CommissionHistory[]; // <-- optional for safety
};

export default function DisplayCommission({
  history = [],
}: CommissionHistoryDialogProps) {
  const [open, setOpen] = useState(false);

  // Ensure history is always a valid array
  const safeHistory = useMemo(
    () => (Array.isArray(history) ? history : []),
    [history]
  );

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        disabled={safeHistory.length === 0}
        title={
          safeHistory.length === 0
            ? "No commission history"
            : "View commission history"
        }
      >
        <History size={16} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Commission History</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            {safeHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No commission history available.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 border-b pb-1 font-semibold">
                  <span>Date</span>
                  <span>Old</span>
                  <span>New</span>
                </div>

                {safeHistory.map((h, index) => {
                  const oldCommission =
                    index === 0 ? "-" : safeHistory[index - 1]?.commission ?? "-";

                  return (
                    <div
                      key={`${h.updatedAt}-${index}`}
                      className="grid grid-cols-3 gap-2 border-b py-1 text-sm"
                    >
                      <span>
                        {h.updatedAt
                          ? new Date(h.updatedAt).toLocaleDateString("en-IN")
                          : "-"}
                      </span>
                      <span>{oldCommission}</span>
                      <span>{h.commission}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
