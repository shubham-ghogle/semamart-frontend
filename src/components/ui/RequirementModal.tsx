import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface RequirementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { salesman: string; entityName: string }) => void;
}

const RequirementModal = ({
  open,
  onOpenChange,
  onSubmit,
}: RequirementModalProps) => {
  const [salesman, setSalesman] = useState("");
  const [entityName, setEntityName] = useState("");

  // Sample salesman data
  const salesmanOptions = [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Williams",
    "David Brown",
    "Emily Davis",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (salesman && entityName.trim()) {
      onSubmit({
        salesman,
        entityName: entityName.trim(),
      });
      setSalesman("");
      setEntityName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Requirement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="salesman">Select Salesman</Label>
            <Select value={salesman} onValueChange={setSalesman} required>
              <SelectTrigger id="salesman" className="w-full h-10">
                <SelectValue placeholder="Select a salesman" />
              </SelectTrigger>
              <SelectContent>
                {salesmanOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityName">Entity Name</Label>
            <Input
              id="entityName"
              type="text"
              placeholder="Enter entity name"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="h-10"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="flex-1 bg-teal-600 text-white hover:bg-teal-700">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequirementModal;