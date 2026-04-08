import { Seller, Order } from "@/Types/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { EyeIcon, UserIcon, Clipboard } from "lucide-react";
import { useNavigate } from "react-router";
import { BASE_URL } from "@/data";
import { getVariantCommission } from "@/lib/utils";

/* ================= TYPES ================= */

type Row = {
  id: string;
  name: string;
  businessName: string;
  email: string;
  joinedOn: string;
  netRevenue: number; // Calculated field
  deleteSeller: (id: string) => void;
  viewSeller: (id: string) => void;
};

type AdminSellerTableProps = {
  sellers: Seller[];
  allOrders: Order[]; // Required for revenue calculation
  onDeleteSeller: (id: string) => void;
};

/* ================= COMPONENT ================= */

export default function AdminSellerTable({
  sellers,
  allOrders,
  onDeleteSeller,
}: AdminSellerTableProps) {
  const navigate = useNavigate();

  // Helper to format currency
  const formatMoney = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(v);

  // PDF Download Logic
  async function handleDownloadPdf(sellerId: string, sellerName?: string) {
    try {
      const url = `${BASE_URL}api/v2/shop/seller-registration-pdf/${sellerId}`;
      const resp = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/pdf" },
      });

      if (!resp.ok) throw new Error("Failed to download PDF");

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const safeName = (sellerName || sellerId).replace(/\s+/g, "_");
      
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${safeName}-registration.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      alert(err?.message || "Could not download PDF.");
    }
  }

  /* ================= DATA MAPPING ================= */

  const rows: Row[] = sellers.map((s) => {
    // 1. Filter orders for this specific seller that are 'Delivered'
    const sellerOrders = allOrders?.filter((o) => {
      const shopId = typeof o.shop === "object" ? o.shop?._id : o.shop;
      return shopId === s._id && o.status === "Delivered";
    }) || [];

    // 2. Calculate Net Revenue (Sales - Platform Fees)
    const sellerNetRevenue = sellerOrders.reduce((acc, o) => {
      const commissionPerUnit = getVariantCommission(o);
      const totalCommission = commissionPerUnit * (o.qty ?? 0);
      
      const orderNet = (o.totalPrice || 0) - totalCommission;
      return acc + orderNet;
    }, 0);

    return {
      id: s._id,
      name: `${s.firstName} ${s.lastName}`,
      businessName: s.businessName || "-",
      email: s.email,
      joinedOn: new Date(s.createdAt).toLocaleDateString("en-IN"),
      netRevenue: sellerNetRevenue,
      deleteSeller: onDeleteSeller,
      viewSeller: (id: string) => navigate(id),
    };
  });

  /* ================= COLUMNS ================= */

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
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "businessName", header: "Business" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "joinedOn", header: "Joined On" },
    { 
      accessorKey: "netRevenue", 
      header: "Net Revenue",
      cell: ({ row }) => (
        <span >
          {formatMoney(row.original.netRevenue)}
        </span>
      )
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/admin/sellers/profile/${row.original.id}`)}
            variant="outline" size="icon" title="View Profile"
          >
            <UserIcon className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => row.original.viewSeller(row.original.id)}
            variant="outline" size="icon" title="Quick View"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => handleDownloadPdf(row.original.id, row.original.businessName)}
            variant="outline" size="icon" title="Download PDF"
          >
            <Clipboard className="w-4 h-4" />
          </Button>
        </div>
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
        enableCalender={true}
        dateFieldId="joinedOn"
      />
    </div>
  );
}
