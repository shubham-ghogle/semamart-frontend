import { Seller } from "@/Types/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { EyeIcon, UserIcon, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { BASE_URL } from "@/data"; // <- make sure this file exports BASE_URL correctly

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

  // Download helper: fetch the PDF and trigger download in browser
  async function handleDownloadPdf(sellerId: string, sellerName?: string) {
    try {
      const url = `${BASE_URL}api/v2/shop/seller-registration-pdf/${sellerId}`;

      const resp = await fetch(url, {
        method: "GET",
        credentials: "include", // include cookies for auth
        headers: {
          // Accept header optional
          Accept: "application/pdf",
        },
      });

      if (!resp.ok) {
        // try to read json message
        let msg = `Failed to download (status ${resp.status})`;
        try {
          const j = await resp.json();
          if (j && j.message) msg = j.message;
        } catch (_) {}
        throw new Error(msg);
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);

      const safeName = (sellerName || sellerId).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-\.]/g, "");
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
      alert(err?.message || "Could not download PDF. Make sure you are logged in as admin and the file exists.");
    }
  }

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
        <article className="flex gap-2">
          <Button
            onClick={() => {
              navigate(`/admin/sellers/profile/${row.original.id}`);
            }}
            variant="outline"
            size="icon"
            title="View Profile"
          >
            <UserIcon />
          </Button>

          <Button
            onClick={() => {
              row.original.viewSeller(row.original.id);
            }}
            variant="outline"
            size="icon"
            title="Quick View"
          >
            <EyeIcon />
          </Button>

          {/* Download button */}
          <Button
            onClick={() => handleDownloadPdf(row.original.id, row.original.businessName)}
            variant="outline"
            size="icon"
            title="Download Registration PDF"
          >
            <Download />
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
      />
    </div>
  );
}
