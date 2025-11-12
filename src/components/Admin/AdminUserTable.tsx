
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { EyeIcon, Trash } from "lucide-react";
import { useNavigate } from "react-router";
import { User } from "@/Screens/Admin/Admin.HooksAndUtils";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedOn: string;
  deleteUser: (id: string) => void;
  viewUser: (id: string) => void;
};

type AdminUserTableProps = {
  users: User[];
  onDeleteUser: (id: string) => void;
};

export default function AdminUserTable({ users, onDeleteUser }: AdminUserTableProps) {
  const navigate = useNavigate();

  const rows: Row[] = users.map((u) => ({
    id: u._id,
    name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "-",
    email: u.email || "-",
    role: u.role || "user",
    joinedOn: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "-",
    deleteUser: onDeleteUser,
    viewUser: (id: string) => {
      // navigate to relative user detail route, adjust if you use /admin/users/:id
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
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "joinedOn", header: "Joined On" },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <article className="flex gap-2">
          <Button
            onClick={() => {
              row.original.deleteUser(row.original.id);
            }}
            variant="destructive"
            size="icon"
            title="Delete user"
          >
            <Trash />
          </Button>
          <Button
            onClick={() => {
              row.original.viewUser(row.original.id);
            }}
            variant="outline"
            size="icon"
            title="View user"
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
        searchColId="email"
        docName="Users"
        data={rows}
        columns={columns}
        searchPlaceholder="Search by email or name"
      />
    </div>
  );
}
