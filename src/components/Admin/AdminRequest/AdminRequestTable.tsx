import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Seller } from "../../../Types/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../ui/data-table";
import { Button } from "../../ui/button";
import {  Check } from "lucide-react";
import { useState } from "react";
import { API_URL } from "@/data";

type Row = {
  id: string;
  name: string;
  businessName: string;
  email: string;
  joinedOn: string;
  verified: boolean;
};

type AdminRequestTableParams = {
  sellers: Seller[];
};

export default function AdminRequestTable({ sellers }: AdminRequestTableParams) {
  const qClient = useQueryClient();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      const response = await fetch(API_URL+"shop/verify-seller", {
        method: "POST",
        credentials: "include", // 🔥 THIS IS REQUIRED
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to verify seller");
      }
      return await response.json();
    },
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: ["sellerRequests"] });
      qClient.invalidateQueries({ queryKey: ["verifiedRequests"] });
      setVerifyingId(null);
    },
    onError: (_, __, ____) => {
      setVerifyingId(null);
    },
  });

  async function clickHandler(id: string) {
    if (verifyingId) return; // protect against double-clicks
    setVerifyingId(id);
    try {
      await verifyMutation.mutateAsync(id);
    } catch (err) {
      // error handled by mutation onError; optionally show toast here
      console.error(err);
      setVerifyingId(null);
    }
  }

  // prepare rows for DataTable
  const rows: Row[] = sellers.map((s) => ({
    id: s._id,
    name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || "-",
    businessName: s.businessName || "n/a",
    email: s.email || "-",
    joinedOn: s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : "-",
    verified: !!s.verified,
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
    { accessorKey: "joinedOn", header: "Date" },
    { accessorKey: "name", header: "Seller" },
    { accessorKey: "businessName", header: "Business" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          {row.original.verified ? (
            <Button disabled size="sm" variant="ghost">
              Verified
            </Button>
          ) : (
            <Button
              onClick={() => clickHandler(row.original.id)}
              disabled={verifyingId === row.original.id}
              size="sm"
            >
              {verifyingId === row.original.id ? "Verifying..." : <><Check className="mr-2" /> Verify</>}
            </Button>
          )}

          {/* <Button
            onClick={() => {
              // navigate to detail page for the seller - adjust route if needed
              navigate(row.original.id);
            }}
            variant="outline"
            size="icon"
            title="View seller"
          >
            <EyeIcon />
          </Button> */}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white shadow rounded">
      <DataTable
        searchColId="businessName"
        docName="Seller Requests"
        data={rows}
        columns={columns}
        searchPlaceholder="Search by business name or email"
        enableCalender={true}
        dateFieldId="joinedOn"
      />
    </div>
  );
}
