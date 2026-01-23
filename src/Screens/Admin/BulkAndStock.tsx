import { useState } from "react";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";
import BulkOrdersTable from "../../components/Admin/BulkOrderTable";
import StockTable from "../../components/Admin/StockUpdateTable";
import OutOfStockTable from "@/components/Admin/OutOfStcokTable";
import BufferStockTable from "../../components/Admin/BufferStockTable";

type TabType = "bulkOrders" | "stock" | "outOfStock" | "bufferStock";

export default function BulkAndStock() {
  const [activeTab, setActiveTab] = useState<TabType>("bulkOrders");

  return (
    <AdminMainWrapper heading="Stock Management" status="success">
      {/* Tabs */}
      <div className="mb-4 flex space-x-4 border-b">
        <button
          className={`pb-2 ${
            activeTab === "bulkOrders"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("bulkOrders")}
        >
          Bulk Orders
        </button>
        <button
          className={`pb-2 ${
            activeTab === "stock"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("stock")}
        >
          Product Requests
        </button>
        <button
          className={`pb-2 ${
            activeTab === "outOfStock"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("outOfStock")}
        >
          Out of Stock
        </button>
        <button
          className={`pb-2 ${
            activeTab === "bufferStock"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("bufferStock")}
        >
          Buffer Stock
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-white shadow rounded">
        {activeTab === "bulkOrders" && <BulkOrdersTable />}
        {activeTab === "stock" && <StockTable />}
        {activeTab === "outOfStock" && <OutOfStockTable />}
        {activeTab === "bufferStock" && <BufferStockTable />}
      </div>
    </AdminMainWrapper>
  );
}
