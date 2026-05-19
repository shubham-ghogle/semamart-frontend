import BulkOrderForm from "@/components/ui/BulkOrderForm";
import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import NotifyMeToast from "@/components/ui/NotifyMeToast";

import {
  AiOutlineShoppingCart,
  AiOutlineQuestionCircle,
  AiOutlineArrowRight,
  AiOutlineCheckCircle,
  AiOutlineBell,
} from "react-icons/ai";
import { useNavigate } from "react-router";
import { API_URL } from "@/data";
import ProductShareSection from "@/components/Product/ProductShareSection";

export default function PurchasePanel({
  product,
  selectedVariant,
  variantBulkOrders,
  selectedPack,
  setSelectedPack,
  handleAddCart,
  handleToggleWishlist,
  inWishlist,
  cartAnimation,
  minOrderQty,
  isAvailableToOrder = true,
}: any) {
  const displayOriginalPrice =
    selectedVariant?.originalPrice ?? product.originalPrice;

  const GREEN = "#3bc177";
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const [openBulkForm, setOpenBulkForm] = useState(false);
  const [showNotifyToast, setShowNotifyToast] = useState(false);

  const safeNumber = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const stock = Number(selectedVariant?.stock ?? 0);
  const moq = safeNumber(minOrderQty ?? product?.minOrderQty ?? 0);
  const isOutOfStock = stock <= 0 || (moq > 0 && stock < moq);
  const isInactive = !isAvailableToOrder;

  const handleBulkOrderClick = () => {
    if (isInactive) return;
    if (!user) {
      navigate("/login");
      return;
    }
    setOpenBulkForm(true);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-md space-y-6 border border-gray-100 md:min-h-[600px]">
      {/* Bulk Packs */}
      <div className="space-y-3">
        {variantBulkOrders?.map((b: any) => {
          const perPiece = b.price / Math.max(b.qty, 1);
          const saved = displayOriginalPrice
            ? Math.round(((displayOriginalPrice - perPiece) / displayOriginalPrice) * 100)
            : 0;
          const isSelected =
            selectedPack?.qty === b.qty && selectedPack?.price === b.price;

          return (
            <button
              type="button"
              key={`${b.qty}-${b.price}`}
              disabled={isInactive}
              onClick={() =>
                setSelectedPack(
                  isSelected
                    ? null
                    : { qty: b.qty, price: b.price, label: `Above ${b.qty} Quantity` },
                )
              }
              className={`flex w-full justify-between items-center p-3 rounded-xl border text-left transition ${
                isInactive
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : isSelected
                  ? "border-[#1C647C] bg-[#ECFBFF] shadow-sm"
                  : "border-gray-200 bg-white hover:border-[#1C647C]/50"
              }`}
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-center">
                  <strong className="text-base font-semibold">Above {b.qty} Quantity</strong>
                  <div
                    style={{
                      background: GREEN,
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontWeight: 700,
                    }}
                  >
                    {saved > 0 ? `${saved}% off` : "—"}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-xs text-gray-600">@ ₹{perPiece.toFixed(2)}/piece</p>
                  {isSelected && (
                    <p className="text-xs font-semibold text-[#1C647C]">Selected</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bulk Order Info */}
      <div
        onClick={handleBulkOrderClick}
        className={`flex justify-between items-center p-3 rounded-xl border border-gray-300 ${
          isInactive ? "cursor-not-allowed bg-gray-50 opacity-70" : "cursor-pointer"
        }`}
      >
        <AiOutlineQuestionCircle className="text-3xl text-[#1C647C]" />
        <div className="flex flex-col gap-1 flex-1 ml-3">
          <p className="text-base font-semibold">For bulk order</p>
          <p className="text-base">Contact Semamart Admin</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <AiOutlineArrowRight className="text-blue-600 text-lg" />
        </div>
      </div>

      {/* Action Buttons */}
      {isInactive ? (
        <button
          type="button"
          disabled
          className="w-full rounded-2xl border border-gray-300 bg-gray-100 px-4 py-3 text-center text-base font-semibold text-gray-500 cursor-not-allowed"
        >
          Not Available to Order
        </button>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={handleAddCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2 font-semibold transition-all relative ${
              isOutOfStock
                ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                : "bg-[#ECFBFF] border-[#1C647C] text-[#1C647C]"
            }`}
          >
            <AiOutlineShoppingCart size={20} />
            Add to Cart
            {cartAnimation && (
              <span className="absolute left-1/2 -translate-x-1/2 -top-10 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce z-50">
                <AiOutlineCheckCircle size={20} />
                Added to Cart! {stock}
              </span>
            )}
          </button>

          <button
            onClick={handleToggleWishlist}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-black border border-[#1C647C] font-semibold"
          >
            {inWishlist ? "Remove Wishlist" : "Add to Wish List"}
          </button>
        </div>
      )}

      {/* Buy Now / Notify Me */}
      {isInactive ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center text-sm font-medium text-amber-700">
          This product is currently inactive and cannot be added to cart, bought, or requested as a bulk order.
        </div>
      ) : isOutOfStock ? (
        <button
          className="w-full py-3 rounded-2xl font-semibold text-lg mt-2 border border-orange-400 text-orange-600 bg-orange-50 flex items-center justify-center gap-2"
          onClick={() => {
            if (!user) {
              navigate("/login");
              return;
            }
            setShowNotifyToast(true);
          }}
        >
          <AiOutlineBell className="text-xl" />
          Notify me when available
        </button>
      ) : (
        <button
          className="w-full text-white py-3 rounded-2xl font-semibold text-lg mt-2"
          style={{ background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)" }}
          onClick={(e) => {
            handleAddCart(e, false);
            navigate("/checkout");
          }}
        >
          Buy Now
        </button>
      )}

      <ProductShareSection productName={product?.name} />

      {/* Bulk Order Form */}
      <BulkOrderForm
        open={openBulkForm}
        onClose={() => setOpenBulkForm(false)}
        variantId={selectedVariant?._id}
        product={{ name: product.name, _id: product._id }}
        price={selectedVariant?.discountPrice}
      />

      {/* Notify Me Toast */}
      {showNotifyToast && (
        <NotifyMeToast
          product={product}
          variant={selectedVariant}
          user={user}
          onClose={() => setShowNotifyToast(false)}
          onSubmit={async (email: string, user_id: string, variant_id?: string) => {
            try {
            const res = await fetch(API_URL + "notifyRequest/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                product_id: product._id,
                shop_id: product.shopId,
                variant_id: variant_id || null,
                email,
                user_id,
              }),
            });

                const data = await res.json();

                // Handle "already exists" as a valid state
                if (data.message.includes("already exists")) {
                  return { success: true, alreadyExists: true, message: data.message };
                }

                return { success: data.success, alreadyExists: false, message: data.message };
              } catch (error) {
                console.error("Notify request failed:", error);
                return { success: false, alreadyExists: false, message: "Something went wrong" };
              }
            }}
          />

      )}
    </div>
  );
}
