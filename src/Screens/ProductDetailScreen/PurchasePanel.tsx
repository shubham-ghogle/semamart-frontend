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

export default function PurchasePanel({
  product,
  selectedVariant,
  variantBulkOrders,
  handleAddCart,
  handleToggleWishlist,
  inWishlist,
  cartAnimation,
  minOrderQty,
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
  const isOutOfStock = stock < moq;

  const handleBulkOrderClick = () => {
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

          return (
            <div
              key={`${b.qty}-${b.price}`}
              className="flex justify-between items-center p-3 rounded-xl border bg-white"
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Order Info */}
      <div
        onClick={handleBulkOrderClick}
        className="flex cursor-pointer justify-between items-center p-3 rounded-xl border border-gray-300"
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

      {/* Buy Now / Notify Me */}
      {isOutOfStock ? (
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
