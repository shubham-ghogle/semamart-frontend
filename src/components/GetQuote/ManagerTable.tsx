import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";// adjust path if needed
import { Button } from "@/components/ui/button";

type Manager = {
  srNo: number;
  date: string;
  name: string;
  phone: string;
  email: string;
};

const demoData: Manager[] = [
  {
    srNo: 1,
    date: "25/02/2026",
    name: "Alice Johnson",
    phone: "+1-202-555-0143",
    email: "alice.johnson@example.com",
  },
  {
    srNo: 2,
    date: "24/02/2026",
    name: "Bob Smith",
    phone: "+1-202-555-0178",
    email: "bob.smith@example.com",
  },
  {
    srNo: 3,
    date: "23/02/2026",
    name: "Carla Reyes",
    phone: "+1-202-555-0122",
    email: "carla.reyes@example.com",
  },
  {
    srNo: 4,
    date: "22/02/2026",
    name: "David Lee",
    phone: "+1-202-555-0199",
    email: "david.lee@example.com",
  },
  {
    srNo: 5,
    date: "21/02/2026",
    name: "Emma Davis",
    phone: "+1-202-555-0133",
    email: "emma.davis@example.com",
  },
];

const ManagerTable: React.FC = () => {
  const handleView = (user: Manager) => {
    alert(`Viewing details for ${user.name}`);
  };

  const columns: ColumnDef<Manager>[] = [
    {
      accessorKey: "srNo",
      header: "Sr No",
    },
    {
      accessorKey: "date",
      header: "Join Date",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "email",
      header: "Email",
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
      <h2 className="text-xl font-semibold mb-4">Manager Table</h2>

      <DataTable
        columns={columns}
        data={demoData}
        docName="Manager Report"
        searchColId="name"
        searchPlaceholder="Search manager..."
        bordered
      />
    </div>
  );
};

export default ManagerTable;