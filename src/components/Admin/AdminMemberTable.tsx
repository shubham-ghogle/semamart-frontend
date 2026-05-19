import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";

type PermissionsType = {
  UploadImage: boolean;
  AllOrders: boolean;
  CurrentOrderStatus: boolean;
  AllSeller: boolean;
  AllSales: boolean;
  AllInstitutes: boolean;
  Requests: boolean;
  StockManagement: boolean;
//   SupportDetail: boolean;
  AllProducts: boolean;
};

export type Member = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  permissions?: PermissionsType;
};

type Row = {
  id: string;
  name: string;
  email: string;
  joinedOn: string;
  role?: string;
};

type Props = {
  users: Member[];
  onDeleteUser: (id: string) => void;
  onEditUser: (user: Member) => void;
};

export default function AdminMemberTable({ users,  onEditUser }: Props) {
  const rows: Row[] = users.map((u) => ({
    id: u._id,
    name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "-",
    role: u.role || "-",
    email: u.email || "-",
    joinedOn: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "-",
  }));

  const columns: ColumnDef<Row>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "joinedOn", header: "Joined On" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = users.find((u) => u._id === row.original.id)!;
        return (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEditUser(user)}>
              <Pencil className="w-4 h-4" />
            </Button>
            {/* <Button variant="destructive" size="sm" onClick={() => onDeleteUser(user._id)}>
              <Trash className="w-4 h-4" />
            </Button> */}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 bg-white shadow rounded">
      <DataTable
        data={rows}
        columns={columns}
        searchColId="email"
        searchPlaceholder="Search by email"
        docName="Members"
      />
    </div>
  );
}
