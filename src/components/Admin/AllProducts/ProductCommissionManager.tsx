import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UpdateCommissionDialog from "../UpdateCommissionDialog";
import { FaRupeeSign } from "react-icons/fa";

type BulkOrder = {
  id: string;
  qty: number;
  price: number;
  commission: number; // per item
};

type Props = {
  productId: string;
  variantId: string;
  productCommission: number;
  bulkOrders: BulkOrder[];
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  });

function calculateBulkDetails(bulk: BulkOrder) {
  const pricePerItem = bulk.qty > 0 ? bulk.price / bulk.qty : 0;
  const totalCommission = bulk.commission * bulk.qty;

  return { pricePerItem, totalCommission };
}

export default function ProductCommissionManager({
  productId,
  variantId,
  productCommission,
  bulkOrders,
}: Props) {
  const [mode, setMode] = useState<"product" | "bulk">("product");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
           <FaRupeeSign/>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Manage Commission</DialogTitle>
        </DialogHeader>

<div className="flex justify-center mb-6">
  {/* The Parent: must have rounded-full and p-1 */}
  <div className="inline-flex items-center p-1 bg-[#1C647C] rounded-full">
    
    <button
      onClick={() => setMode("product")}
      className={`px-6 py-2 text-sm font-semibold transition-all duration-200 ${
        mode === "product"
          ? "bg-white text-[#1C647C] rounded-full shadow-sm" // Added rounded-full here
          : "text-white/80 hover:text-white"
      }`}
    >
      Product
    </button>

    <button
      onClick={() => setMode("bulk")}
      className={`px-6 py-2 text-sm font-semibold transition-all duration-200 ${
        mode === "bulk"
          ? "bg-white text-[#1C647C] rounded-full shadow-sm" // Added rounded-full here
          : "text-white/80 hover:text-white"
      }`}
    >
      Bulk Pricing
    </button>
  </div>
</div>
        {/* CONTENT */}
        {mode === "product" ? (
          <div className="space-y-4">
            {/* Product Card */}
            <div className="rounded-xl border p-5 bg-gradient-to-br from-slate-50 to-slate-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Product Commission
              </p>

              <div className="flex items-end justify-between mt-2">
                <h2 className="text-2xl font-bold">
                  ₹ {formatCurrency(productCommission)}
                </h2>
                <span className="text-sm text-gray-500">per item</span>
              </div>
            </div>

            <UpdateCommissionDialog
              currentCommission={productCommission}
              productId={productId}
              variantId={variantId}
              title="Update Product Commission"
            />
          </div>
        ) : (
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {bulkOrders.length === 0 ? (
              <div className="border rounded-xl p-6 text-center text-sm text-gray-500">
                No bulk pricing tiers yet.
                <div className="mt-2 text-xs">
                  Add bulk tiers to define quantity-based pricing.
                </div>
              </div>
            ) : (
              bulkOrders.map((bulk) => {
                const { pricePerItem, totalCommission } =
                  calculateBulkDetails(bulk);

                return (
                  <div
                    key={bulk.id}
                    className="border rounded-xl p-4 bg-white shadow-sm hover:shadow transition"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">Qty {bulk.qty}</h3>

                       <div className="flex items-center space-x-2">
                      <UpdateCommissionDialog
                        currentCommission={bulk.commission}
                        productId={productId}
                        variantId={variantId}
                        bulkOrderId={bulk.id}
                        title={`Update Bulk Commission`}
                      />
                    </div>
                    </div>

                    {/* Grid Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Bulk Price</p>
                        <p className="font-medium">
                          ₹ {formatCurrency(bulk.price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Price / Item</p>
                        <p className="font-medium">
                          ₹ {formatCurrency(pricePerItem)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Commission / Item</p>
                        <p className="font-medium">
                          ₹ {formatCurrency(bulk.commission)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Total Commission</p>
                        <p className="font-semibold text-[#1C647C]">
                          ₹ {formatCurrency(totalCommission)}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                   
                  </div>
                );
              })
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}