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
  commission: number;
};

type Props = {
  productId: string;
  variantId: string;
  productCommission: number;
  bulkOrders: BulkOrder[];
};

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
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
  const [isBulkMode, setIsBulkMode] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FaRupeeSign />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Commission</DialogTitle>
        </DialogHeader>

        {/* ✅ CLEAN TOGGLE */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          <span
            className={`text-xs font-bold ${
              !isBulkMode ? "text-[#1C647C]" : "text-slate-400"
            }`}
          >
            Product Commission
          </span>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isBulkMode}
              onChange={() => setIsBulkMode(!isBulkMode)}
            />

            {/* Track */}
            <div className="w-14 h-7 bg-[#94C0EB] rounded-full"></div>

            {/* Thumb */}
            <div
              className={`absolute w-9 h-9 bg-[#1C647C] rounded-full shadow-md transform transition-all duration-300 ${
                isBulkMode ? "translate-x-6" : "-translate-x-1"
              }`}
            />
          </label>

          <span
            className={`text-xs font-bold ${
              isBulkMode ? "text-[#1C647C]" : "text-slate-400"
            }`}
          >
            Bulk Commission
          </span>
        </div>

        {/* CONTENT */}
        {!isBulkMode ? (
          <div className="space-y-4">
            <div className="rounded-xl border p-5 bg-gradient-to-br from-slate-50 to-slate-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Product Commission
              </p>
              <div className="flex items-end justify-between mt-2">
                <h2 className="text-2xl font-bold">
                  {formatter.format(productCommission)}
                </h2>
                <span className="text-sm text-gray-500">per unit</span>
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
                No bulk pricing  yet.
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
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">Qty {bulk.qty}</h3>
                      <UpdateCommissionDialog
                        currentCommission={bulk.commission}
                        productId={productId}
                        variantId={variantId}
                        bulkOrderId={bulk.id}
                        title="Update Bulk Commission"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Bulk Price</p>
                        <p className="font-medium">
                          {formatter.format(bulk.price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Price / Unit</p>
                        <p className="font-medium">
                          {formatter.format(pricePerItem)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Commission / Unit</p>
                        <p className="font-medium">
                          {formatter.format(bulk.commission)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Total Commission</p>
                        <p className="font-semibold text-[#1C647C]">
                          {formatter.format(totalCommission)}
                        </p>
                      </div>
                    </div>
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