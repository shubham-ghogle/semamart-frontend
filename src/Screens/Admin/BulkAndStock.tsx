import { useState } from "react";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";
import BulkOrdersTable from "../../components/Admin/BulkOrderTable";
import StockTable from "../../components/Admin/StockUpdateTable";

export default function BulkAndStock() {
  const [activeTab, setActiveTab] = useState<"bulkOrders" | "stock">("bulkOrders");

  return (
    <AdminMainWrapper heading="Stock Management" status="success">
      <div className="mb-4 flex space-x-4 border-b">
        <button
          className={`pb-2 ${
            activeTab === "bulkOrders" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("bulkOrders")}
        >
          Bulk Orders
        </button>
        <button
          className={`pb-2 ${
            activeTab === "stock" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("stock")}
        >
          Stock Table
        </button>
      </div>

      <div className="p-4 bg-white shadow rounded">
        {activeTab === "bulkOrders" && <BulkOrdersTable />}
        {activeTab === "stock" && <StockTable />}
      </div>
    </AdminMainWrapper>
  );
}
