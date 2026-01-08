import BulkOrderForm from "@/components/ui/BulkOrderForm";
import { useState } from "react";
import { useUserStore } from "@/store/userStore";

import {
  AiOutlineShoppingCart,
  AiOutlineQuestionCircle,
  AiOutlineArrowRight,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { useNavigate } from "react-router";

export default function PurchasePanel({
  product,
  selectedVariant,
  variantBulkOrders,
  handleAddCart,
  handleToggleWishlist,
  inWishlist,
  cartAnimation,
}: any) {
  const displayOriginalPrice =
    selectedVariant?.originalPrice ?? product.originalPrice;

  const GREEN = "#3bc177";
  const n = useNavigate();
  const user = useUserStore((state) => state.user);
  const [openBulkForm, setOpenBulkForm] = useState(false);
  const navigate = useNavigate();

    const handleBulkOrderClick = () => {
      if (!user) {
        navigate("/login");
        return;
      }
      setOpenBulkForm(true);
    };



  return (
    <div className="w-full max-w-sm mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-md space-y-6 border border-gray-100 md:min-h-[600px]">
      
      {/* Bulk Packs (Normal Text Display) */}
      <div className="space-y-3">
        {variantBulkOrders && variantBulkOrders.length > 0 &&
          variantBulkOrders.map((b: any) => {
            const perPiece = b.price / Math.max(b.qty, 1);
            const saved = displayOriginalPrice
              ? Math.round(
                  ((displayOriginalPrice - perPiece) /
                    displayOriginalPrice) *
                    100
                )
              : 0;

            return (
              <div
                key={`${b.qty}-${b.price}`}
                className="flex justify-between items-center p-3 rounded-xl border bg-white"
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-center">
                    <strong className="text-base font-semibold">
                     Above {b.qty} Quantity
                    </strong>

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
                    <p className="text-xs text-gray-600">
                      @ ₹{perPiece.toFixed(2)}/piece
                    </p> 
                     {/* <p className="text-orange-500 font-semibold text-base">
                      ₹{b.price.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </p> */}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Bulk Order Info */}
      <div  onClick={handleBulkOrderClick} className="flex cursor-pointer justify-between items-center p-3 rounded-xl border border-gray-300">
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
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-2 font-semibold text-[#1C647C]
          bg-[#ECFBFF] border border-[#1C647C] transition-all relative"
        >
          <AiOutlineShoppingCart size={20} />
          Add to Cart

          {cartAnimation && (
            <span
              className="absolute left-1/2 -translate-x-1/2 -top-10 bg-green-500 text-white
              px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce z-50"
            >
              <AiOutlineCheckCircle size={20} />
              Added to Cart!
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

      {/* Buy Now */}
      <button
        className="w-full text-white py-3 rounded-2xl font-semibold text-lg mt-2"
        style={{
          background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)",
        }}
        onClick={(e) => {
          handleAddCart(e, false);
          n("/checkout");
        }}
      >
        Buy Now
      </button>

        <BulkOrderForm
          open={openBulkForm}
          onClose={() => setOpenBulkForm(false)}
          variantId={selectedVariant?._id}
          product={{ name: product.name, _id : product._id }}
          price={selectedVariant?.discountPrice}
        />

    </div>
  );
}
