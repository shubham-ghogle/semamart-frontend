import React from "react";
import TableLayout from "./TableLayout";

const demoData = [
  {
    srNo: 1,
    date: "2026-02-25",
    name: "Alice Johnson",
    phone: "+1-202-555-0143",
    email: "alice.johnson@example.com",
  },
  {
    srNo: 2,
    date: "2026-02-24",
    name: "Bob Smith",
    phone: "+1-202-555-0178",
    email: "bob.smith@example.com",
  },
  {
    srNo: 3,
    date: "2026-02-23",
    name: "Carla Reyes",
    phone: "+1-202-555-0122",
    email: "carla.reyes@example.com",
  },
  {
    srNo: 4,
    date: "2026-02-22",
    name: "David Lee",
    phone: "+1-202-555-0199",
    email: "david.lee@example.com",
  },
  {
    srNo: 5,
    date: "2026-02-21",
    name: "Emma Davis",
    phone: "+1-202-555-0133",
    email: "emma.davis@example.com",
  },
];

const ManagerTable: React.FC = () => {
  const handleView = (user: typeof demoData[0]) => {
    alert(`Viewing details for ${user.name}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Manager Table</h2>
      <TableLayout data={demoData} onView={handleView} />
    </div>
  );
};

export default ManagerTable;