import { useEffect } from "react"
import {
  AiOutlineShoppingCart,
  AiOutlineQuestionCircle,
  AiOutlineArrowRight,
  AiOutlineCheckCircle,
} from "react-icons/ai"
 
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
}: any) {
  const displayOriginalPrice =
    selectedVariant?.originalPrice ?? product.originalPrice
  const displayDiscountPrice =
    selectedVariant?.discountPrice ?? product.discountPrice
  const GREEN = "#3bc177"
 
  // ✅ Ensure "1 Pack" is default
  useEffect(() => {
    if (!selectedPack) {
      setSelectedPack({
        qty: 1,
        price: displayDiscountPrice ?? displayOriginalPrice ?? 0,
        label: "1 Pack",
      })
    }
  }, [selectedPack, displayOriginalPrice, displayDiscountPrice, setSelectedPack])
 
  // ✅ discount for 1 Pack
  const onePackDiscount =
    displayOriginalPrice && displayDiscountPrice
      ? Math.round(
          ((displayOriginalPrice - displayDiscountPrice) /
            Math.max(displayOriginalPrice, 1)) *
            100
        )
      : 0
 
  return (
    <div
       className="w-full max-w-sm mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-md space-y-6 border border-gray-100"
      style={{ minHeight: "600px" }}
    >
      <div className="space-y-3">
        {/* 1 Pack option */}
        <label
          className="flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all duration-200"
          style={{
            backgroundColor: selectedPack?.qty === 1 ? "#ECFBFF" : "white",
          }}
        >
          <div className="flex items-start gap-3 w-full">
            <input
              type="radio"
              name="pack"
              value="1"
              checked={selectedPack?.qty === 1}
              onChange={() =>
                setSelectedPack({
                  qty: 1,
                  price: displayDiscountPrice ?? displayOriginalPrice ?? 0,
                  label: "1 Pack",
                })
              }
              className="mt-1 w-4 h-4 accent-[#006666]"
            />
            <div className="flex flex-col w-full gap-1">
              <div className="flex justify-between items-center">
                <strong className="text-base font-semibold">1 Pack</strong>
                <div
                  style={{
                    background: GREEN,
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: 6,
                    fontWeight: 700,
                  }}
                >
                  {onePackDiscount > 0 ? `${onePackDiscount}% off` : "—"}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-xs text-gray-600">
                  @ ₹{(displayDiscountPrice ?? displayOriginalPrice)}/piece
                </p>
                <p className="text-orange-500 font-semibold text-base">
                  ₹{displayDiscountPrice ?? displayOriginalPrice}
                </p>
              </div>
            </div>
          </div>
        </label>
 
        {/* Other bulk orders */}
        {variantBulkOrders && variantBulkOrders.length > 0
          ? variantBulkOrders.map((b: any) => {
              const perPiece = b.price / Math.max(b.qty, 1)
              const saved = displayOriginalPrice
                ? Math.round(
                    ((displayOriginalPrice - perPiece) / displayOriginalPrice) *
                      100
                  )
                : 0
              return (
                <label
                  key={`${b.qty}-${b.price}`}
                  className="flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor:
                      selectedPack?.qty === b.qty ? "#ECFBFF" : "white",
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <input
                      type="radio"
                      name="pack"
                      value={b.qty}
                      checked={selectedPack?.qty === b.qty}
                      onChange={() =>
                        setSelectedPack({
                          qty: b.qty,
                          price: b.price,
                          label: `${b.qty} Pack`,
                        })
                      }
                      className="mt-1 w-4 h-4 accent-[#006666]"
                    />
                    <div className="flex flex-col w-full gap-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-base font-semibold">
                          {b.qty} Pack
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
                        <p className="text-orange-500 font-semibold text-base">
                          ₹{b.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              )
            })
          : null}
      </div>
 
      {/* Bulk order info */}
      <label className="flex justify-between items-center p-3 rounded-xl border border-gray-300 cursor-pointer">
        <AiOutlineQuestionCircle className="text-3xl text-[#1C647C] mb-5" />
        <div className="flex flex-col gap-1">
          <p className="text-base text-dark font-semibold">For bulk order</p>
          <p className="text-base">Contact Semamart Admin</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-4">
          <AiOutlineArrowRight className="text-blue-600 text-lg" />
        </div>
      </label>
 
      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleAddCart}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-2 font-semibold text-[#1C647C] bg-[#ECFBFF] border border-[#1C647C] transition-all relative"
        >
          <AiOutlineShoppingCart size={20} />
          Add to Cart
          {cartAnimation && (
            <span className="absolute left-1/2 -translate-x-1/2 -top-10 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce z-50">
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
 
      <button
        className="w-full text-white py-3 rounded-2xl font-semibold text-lg mt-2"
        style={{
          background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)",
        }}
      >
        Buy Now
      </button>
    </div>
  )
}