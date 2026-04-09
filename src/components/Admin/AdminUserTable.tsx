import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import {
  UserIcon,
  Heart,
  ShoppingCart,
  Package,
  Clipboard,
} from "lucide-react";
import { useNavigate } from "react-router";
import { User } from "@/Screens/Admin/Admin.HooksAndUtils";
import { BASE_URL } from "@/data";
import { toast } from "react-toastify";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedOn: string;
  instituteName: string;
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
    instituteName: u.instituteName || "-",
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

  // PDF download helper
  async function handleDownloadPdf(userId: string, userName?: string) {
    try {
      const url = `${BASE_URL}api/v2/user/user-registration-pdf/${userId}`;

      const resp = await fetch(url, {
        method: "GET",
        credentials: "include", // ensures cookies are sent for auth
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!resp.ok) {
        let msg = `Failed to download (status ${resp.status})`;
        try {
          const j = await resp.json();
          if (j && j.message) msg = j.message;
        } catch (_) {}
        throw new Error(msg);
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);

      const safeName = (userName || userId)
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_\-\.]/g, "");
      const filename = `${safeName}-registration.pdf`;

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error("PDF download error:", err);
      toast.error(err?.message || "Could not download PDF. Ensure you are logged in as admin and the file exists.");
    }
  }

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
    { accessorKey: "instituteName", header: "Institute" },
    { accessorKey: "email", header: "Email" },
    // { accessorKey: "role", header: "Role" },
    { accessorKey: "joinedOn", header: "Joined On" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <article className="flex gap-2 flex-wrap">
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

          <Button
            onClick={() =>
              navigate(`/admin/users/cart/${row.original.id}`)
            }
            variant="outline"
            size="icon"
            title="Cart"
          >
            <ShoppingCart />
          </Button>

          <Button
            onClick={() =>
              navigate(`/admin/users/${row.original.id}/products`)
            }
            variant="outline"
            size="icon"
            title="Ordered Products"
          >
            <Package />
          </Button>

          {/* Download registration PDF */}
          <Button
            onClick={() => handleDownloadPdf(row.original.id, row.original.name)}
            variant="outline"
            size="icon"
            title="Download Registration PDF"
          >
            <Clipboard />
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
        searchPlaceholder="Search by email"
        enableCalender={true}
        dateFieldId="joinedOn"
      />
    </div>
  );
}
