import React, { useState } from "react";
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
} from "@/components/ui/dialog";

interface RequirementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { salesman: string; entityName: string; type: "requirement" | "quotation" }) => void;
  type: "requirement" | "quotation";
  showSalesmanDropdown?: boolean;
}

const RequirementModal = ({
  open,
  onOpenChange,
  onSubmit,
  type,
  showSalesmanDropdown = true,
}: RequirementModalProps) => {
  const [salesman, setSalesman] = useState("");
  const [entityName, setEntityName] = useState("");

  // Reset form fields when modal opens
  React.useEffect(() => {
    if (open) {
      setSalesman("");
      setEntityName("");
    }
  }, [open]);

  // Sample salesman data
  const salesmanOptions = [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Williams",
    "David Brown",
    "Emily Davis",
  ];

  const handleSubmit = () => {
    console.log("handleSubmit called");
    if (entityName.trim()) {
      console.log("onSubmit called with data:", {
        salesman: showSalesmanDropdown ? salesman : "",
        entityName: entityName.trim(),
        type,
      });
      onSubmit({
        salesman: showSalesmanDropdown ? salesman : "",
        entityName: entityName.trim(),
        type,
      });
      setSalesman("");
      setEntityName("");
    } else {
      console.log("Entity name is empty, not submitting");
    }
  };

  return (
     <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{type === "requirement" ? "Requirement" : "Quotation"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex gap-4 items-end">
            {showSalesmanDropdown && (
              <div className="flex-1">
                <Label htmlFor="salesman">Select Salesman</Label>
                <Select value={salesman} onValueChange={setSalesman}>
                  <SelectTrigger id="salesman" className="w-full h-10">
                    <SelectValue placeholder="Select" />
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
            )}
            <div className={`flex-1 ${showSalesmanDropdown ? '' : 'w-full'}`}>
              <Label htmlFor="entityName">Entity/Customer Name</Label>
              <Input
                id="entityName"
                type="text"
                placeholder="Search Entity/Customer Name"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <Button onClick={handleSubmit} className="bg-teal-600 text-white hover:bg-teal-700">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequirementModal;