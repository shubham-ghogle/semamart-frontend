
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: any;
  type: "customer" | "requirement" | "quotation" | "manager" | "salesman";
}

const ViewModal = ({
  open,
  onOpenChange,
  title,
  data,
  type,
}: ViewModalProps) => {
  // Render customer details
  const renderCustomerDetails = () => {
    if (!data) return null;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UID</label>
            <div className="p-2 bg-gray-50 rounded">{data.uid}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="p-2 bg-gray-50 rounded">{data.date}</div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salesman</label>
          <div className="p-2 bg-gray-50 rounded">{data.salesman}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <div className="p-2 bg-gray-50 rounded">{data.entityType}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
            <div className="p-2 bg-gray-50 rounded">{data.entityName}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <div className="p-2 bg-gray-50 rounded">{data.state}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <div className="p-2 bg-gray-50 rounded">{data.district}</div>
          </div>
        </div>
        
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
          <div className="p-2 bg-gray-50 rounded">{data.designation}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="p-2 bg-gray-50 rounded">{data.phoneNumber}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="p-2 bg-gray-50 rounded">{data.email}</div>
          </div>
        </div>
      </div>
    );
  };

  // Render requirement details
  const renderRequirementDetails = () => {
    if (!data) return null;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UID</label>
            <div className="p-2 bg-gray-50 rounded">{data.uid}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="p-2 bg-gray-50 rounded">{data.date}</div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salesman</label>
          <div className="p-2 bg-gray-50 rounded">{data.salesman}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <div className="p-2 bg-gray-50 rounded">{data.entityType}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
            <div className="p-2 bg-gray-50 rounded">{data.entityName}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <div className="p-2 bg-gray-50 rounded">{data.state}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <div className="p-2 bg-gray-50 rounded">{data.district}</div>
          </div>
        </div>
        
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
          <div className="p-2 bg-gray-50 rounded">{data.designation}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="p-2 bg-gray-50 rounded">{data.phoneNumber}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="p-2 bg-gray-50 rounded">{data.email}</div>
          </div>
        </div>
      </div>
    );
  };

  // Render quotation details
  const renderQuotationDetails = () => {
    if (!data) return null;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UID</label>
            <div className="p-2 bg-gray-50 rounded">{data.uid}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="p-2 bg-gray-50 rounded">{data.date}</div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salesman</label>
          <div className="p-2 bg-gray-50 rounded">{data.salesman}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <div className="p-2 bg-gray-50 rounded">{data.entityType}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
            <div className="p-2 bg-gray-50 rounded">{data.entityName}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <div className="p-2 bg-gray-50 rounded">{data.state}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <div className="p-2 bg-gray-50 rounded">{data.district}</div>
          </div>
        </div>
        
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
          <div className="p-2 bg-gray-50 rounded">{data.designation}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="p-2 bg-gray-50 rounded">{data.phoneNumber}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="p-2 bg-gray-50 rounded">{data.email}</div>
          </div>
        </div>
      </div>
    );
  };

  // Render manager details
  const renderManagerDetails = () => {
    if (!data) return null;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UID</label>
            <div className="p-2 bg-gray-50 rounded">{data.uid}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="p-2 bg-gray-50 rounded">{data.name}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="p-2 bg-gray-50 rounded">{data.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="p-2 bg-gray-50 rounded">{data.phoneNumber}</div>
          </div>
        </div>
      </div>
    );
  };

  // Render salesman details
  const renderSalesmanDetails = () => {
    if (!data) return null;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UID</label>
            <div className="p-2 bg-gray-50 rounded">{data.uid}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="p-2 bg-gray-50 rounded">{data.name}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="p-2 bg-gray-50 rounded">{data.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="p-2 bg-gray-50 rounded">{data.phoneNumber}</div>
          </div>
        </div>
      </div>
    );
  };



  // Render appropriate details based on type
  const renderDetails = () => {
    switch (type) {
      case "customer":
        return renderCustomerDetails();
      case "requirement":
        return renderRequirementDetails();
      case "quotation":
        return renderQuotationDetails();
      case "manager":
        return renderManagerDetails();
      case "salesman":
        return renderSalesmanDetails();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto">
          {renderDetails()}
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="bg-teal-600 text-white hover:bg-teal-700">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewModal;
