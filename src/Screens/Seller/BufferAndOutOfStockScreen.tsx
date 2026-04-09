import { useState } from "react";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import OutOfStockTable from "@/components/Seller/OutOfStockProduct";
import BufferStockTable from "../../components/Seller/BufferStock";
import { useSellerSession } from "./sellerSession";

type TabType =  "outOfStock" | "bufferStock";

export default function BufferAndOutOfStockScreen() {
  const { canAccess } = useSellerSession();
  const [activeTab, setActiveTab] = useState<TabType>("outOfStock");

  if (!canAccess("StockManagement")) {
    return (
      <SellerMainWrapper heading="Stock Management" status="success">
        <div className="rounded-xl border bg-white p-4 text-gray-600">
          You do not have access to stock management.
        </div>
      </SellerMainWrapper>
    );
  }

  return (
    <SellerMainWrapper heading="Stock Management" status="success">
      <div className="mb-4 flex space-x-4 border-b">
       
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
        {activeTab === "outOfStock" && <OutOfStockTable />}
        {activeTab === "bufferStock" && <BufferStockTable />}
      </div>
    </SellerMainWrapper>
  );
}
