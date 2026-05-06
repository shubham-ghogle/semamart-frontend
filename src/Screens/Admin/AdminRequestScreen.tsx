import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOrderRequests, getAllSellers } from "./Admin.HooksAndUtils";
import AdminRequestTable from "../../components/Admin/AdminRequest/AdminRequestTable";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";
import { Seller } from "../../Types/types";
import OrderRequestTable from "@/components/Order/OrderRequestTable";

type RequestTab = "seller" | "order";

export default function AdminRequestScreen() {
  const [activeTab, setActiveTab] = useState<RequestTab>("order");

  const sellerQuery = useQuery({
    queryKey: ["sellerRequests"],
    queryFn: getAllSellers,
  });

  const orderQuery = useQuery({
    queryKey: ["admin-order-requests"],
    queryFn: getAdminOrderRequests,
  });

  const unverifiedSellers: Seller[] =
    sellerQuery.status === "success" && sellerQuery.data
      ? sellerQuery.data.sellers.filter((s) => s.verified === false)
      : [];

  const currentStatus = activeTab === "order" ? orderQuery.status : sellerQuery.status;
  const currentError = activeTab === "order" ? orderQuery.error?.message : sellerQuery.error?.message;

  return (
    <AdminMainWrapper
      status={currentStatus}
      heading="Requests"
      errorMeassage={currentError}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("order")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            activeTab === "order"
              ? "bg-sky-700 text-white"
              : "bg-white text-slate-700 shadow-sm"
          }`}
        >
          Order Requests
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seller")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            activeTab === "seller"
              ? "bg-sky-700 text-white"
              : "bg-white text-slate-700 shadow-sm"
          }`}
        >
          Seller Registrations
        </button>
      </div>

      {activeTab === "order" && orderQuery.status === "success" && (
        <OrderRequestTable
          orders={orderQuery.data}
          basePath="/admin/orders"
          customerLabel="Institute"
        />
      )}

      {activeTab === "seller" && sellerQuery.status === "success" && (
        <AdminRequestTable sellers={unverifiedSellers} />
      )}
    </AdminMainWrapper>
  );
}
