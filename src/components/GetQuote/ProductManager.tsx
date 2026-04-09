import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table"; // adjust path if needed
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

type HospitalProduct = {
  srNo: number;
  productName: string;
  category: string;
  manufacturer: string;
  stock: number;
  status: string;
};

const demoProducts: HospitalProduct[] = [
  {
    srNo: 1,
    productName: "Surgical Gloves",
    category: "Consumables",
    manufacturer: "MedCare Pvt Ltd",
    stock: 500,
    status: "Available",
  },
  {
    srNo: 2,
    productName: "Face Mask",
    category: "Safety",
    manufacturer: "HealthPro Industries",
    stock: 1200,
    status: "Available",
  },
  {
    srNo: 3,
    productName: "IV Cannula",
    category: "Medical Equipment",
    manufacturer: "LifeLine Medical",
    stock: 150,
    status: "Low Stock",
  },
  {
    srNo: 4,
    productName: "Thermometer",
    category: "Diagnostics",
    manufacturer: "CareTech",
    stock: 80,
    status: "Available",
  },
  {
    srNo: 5,
    productName: "Syringe 5ml",
    category: "Consumables",
    manufacturer: "MedCare Pvt Ltd",
    stock: 40,
    status: "Low Stock",
  },
];

const ProductManager: React.FC = () => {
  const handleView = (product: HospitalProduct) => {
    toast.info(`Viewing ${product.productName}`);
  };

  const columns: ColumnDef<HospitalProduct>[] = [
    {
      accessorKey: "srNo",
      header: "Sr No",
    },
    {
      accessorKey: "productName",
      header: "Product Name",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "manufacturer",
      header: "Manufacturer",
    },
    {
      accessorKey: "stock",
      header: "Stock",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={
              status === "Low Stock"
                ? "text-red-600 font-medium"
                : "text-green-600 font-medium"
            }
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleView(row.original)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
       Product
      </h1>

      <DataTable
        columns={columns}
        data={demoProducts}
        docName="Hospital Products"
        searchColId="productName"
        searchPlaceholder="Search product..."
        bordered
      />
    </div>
  );
};

export default ProductManager;
