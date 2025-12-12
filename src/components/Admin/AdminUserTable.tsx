import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import {
  UserIcon,
  Heart,
  ShoppingCart,
  Package,
} from "lucide-react";
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

export default function AdminUserTable({
  users,
  onDeleteUser,
}: AdminUserTableProps) {
  const navigate = useNavigate();

  const rows: Row[] = users.map((u) => ({
    id: u._id,
    name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "-",
    email: u.email || "-",
    role: u.role || "user",
    joinedOn: u.createdAt
      ? new Date(u.createdAt).toLocaleDateString("en-IN")
      : "-",
    deleteUser: onDeleteUser,
    viewUser: (id: string) => {
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
          onChange={(e) =>
            table.toggleAllPageRowsSelected(!!e.target.checked)
          }
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <article className="flex gap-2 flex-wrap">
          {/* View User */}
          {/* <Button
            onClick={() => row.original.viewUser(row.original.id)}
            variant="outline"
            size="icon"
            title="View user"
          >
            <EyeIcon />
          </Button> */}

          {/* User Profile */}
          <Button
            onClick={() =>
              navigate(`/admin/users/profile/${row.original.id}`)
            }
            variant="outline"
            size="icon"
            title="User profile"
          >
            <UserIcon />
          </Button>

          {/* Wishlist */}
          <Button
            onClick={() =>
              navigate(`/admin/users/wishlist/${row.original.id}`)
            }
            variant="outline"
            size="icon"
            title="Wishlist"
          >
            <Heart />
          </Button>

          {/* Cart */}
          <Button
            onClick={() =>
              navigate(`/admin/users/add-to-cart/${row.original.id}`)
            }
            variant="outline"
            size="icon"
            title="Cart"
          >
            <ShoppingCart />
          </Button>

          {/* Products */}
          <Button
            onClick={() =>
              navigate(`/admin/users/${row.original.id}/products`)
            }
            variant="outline"
            size="icon"
            title="Products"
          >
            <Package />
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
        enableCalender={true}
        dateFieldId="joinedOn"
      />
    </div>
  );
}
