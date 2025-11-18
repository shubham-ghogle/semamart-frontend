import { Seller } from "@/Types/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { EyeIcon, Trash } from "lucide-react";
import { useNavigate } from "react-router";

type Row = {
  id: string;
  name: string;
  businessName: string;
  email: string;
  joinedOn: string;
  deleteSeller: (id: string) => void;
  viewSeller: (id: string) => void;
};

type AdminSellerTableProps = {
  sellers: Seller[];
  onDeleteSeller: (id: string) => void;
};
export default function AdminSellerTable({
  sellers,
  onDeleteSeller,
}: AdminSellerTableProps) {

  const navigate = useNavigate();

  const rows: Row[] = sellers.map((s) => ({
    id: s._id,
    name: s.firstName + " " + s.lastName,
    businessName: s.businessName || "-",
    email: s.email,
    joinedOn: new Date(s.createdAt).toLocaleDateString("en-IN"),
    deleteSeller: onDeleteSeller,
    viewSeller: (id: string) => {
      navigate(id);
    },
  }));

  const columns: ColumnDef<Row>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "businessName", header: "Business Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "joinedOn", header: "Joined On" },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <article className="flex gap-4">
          <Button
            onClick={() => {
              row.original.deleteSeller(row.original.id);
            }}
            variant="destructive"
            size="icon"
          >
            <Trash />
          </Button>
          <Button
            onClick={() => {
              row.original.viewSeller(row.original.id);
            }}
            variant="outline"
            size="icon"
          >
            <EyeIcon />
          </Button>
        </article>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white shadow rounded">
      <DataTable
        searchColId="businessName"
        docName="Sellers"
        data={rows}
        columns={columns}
        searchPlaceholder="Search by business name"
        // enableCalender={true}
        // dateFieldId="joinedOn"
      />
    </div>
  );
}
