import { useState } from "react"
import offer from "../../../public/offer.png"

export default function ProductInfoSection({
  product,
  selectedVariant,
  selectedPack,
  selectedPerPiece,
}: any) {
  const [selectedOffer, setSelectedOffer] = useState<any>(null)

  const displayOriginalPrice =
    selectedVariant?.originalPrice ?? product.originalPrice
  const displayDiscountPrice =
    selectedVariant?.discountPrice ?? product.discountPrice

  // ✅ main price
  const mainPrice = selectedPack
    ? selectedPack.price
    : displayDiscountPrice ?? displayOriginalPrice ?? 0

  const STAR_COLOR = "#FFD700"

  // ✅ discount calculation
  let topDiscount = 0
  if (selectedPack) {
    const perPiece = selectedPerPiece
    if (displayOriginalPrice) {
      topDiscount = Math.round(
        ((displayOriginalPrice - perPiece) / displayOriginalPrice) * 100
      )
    }
  } else if (displayOriginalPrice && displayDiscountPrice) {
    topDiscount = Math.round(
      ((displayOriginalPrice - displayDiscountPrice) /
        Math.max(displayOriginalPrice, 1)) *
        100
    )
  }

  return (
    <div className="w-full bg-white rounded-lg p-4 shadow-lg space-y-6" style={{ minHeight: 540 }}>
      {/* Title + Discount */}
     <div className="flex justify-between items-start">
      <h2 className="text-xl md:text-xl font-bold text-[#1C647C]">{product.name}</h2>
      {topDiscount > 0 && (
        <div className="p-3 py-3 rounded-sm border border-green-500 text-green-500 font-bold bg-white">
          {topDiscount}% OFF
        </div>
      )}
    </div>



      {/* Rating */}
      <div className="flex items-center text-base text-gray-500 mb-2 gap-3">
        <div style={{ color: STAR_COLOR, fontSize: "1.75rem" }}>
          {"★".repeat(3)}
          {"☆".repeat(2)}
        </div>
        {product.reviews?.length && <span>({product.reviews.length} reviews)</span>}
      </div>

      {/* Price */}
      <div className="mt-2">
       <div className="mt-2 flex flex-col gap-1">
  {/* Top row: Discount % and discounted price */}
  <div className="flex items-baseline gap-2">
    {topDiscount > 0 && (
      <span className="text-red-500 font-bold text-lg">
        -{topDiscount}%
      </span>
    )}
    <span className="text-[28px] font-bold text-[#FB9573]">
      ₹{mainPrice}
    </span>
  </div>

  {/* Original price below */}
  {displayOriginalPrice && displayDiscountPrice && (
    <span className="text-gray-400 text-sm line-through">
      M.R.P.: ₹{displayOriginalPrice}
    </span>
  )}
</div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-2">
  {/* GST Note */}
  <div className="text-sm text-gray-500 whitespace-nowrap">
    *Do not include GST
  </div>

  {/* Shipping Banner */}
  <div
    className="mt-2 sm:mt-0 flex items-center justify-center"
    style={{
      height: 32,
      paddingLeft: 12,
      paddingRight: 24,
      background: "#FFEB99",
      fontWeight: 600,
      clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)",
      borderRadius: 8,
    }}
  >
    Shipping Charge at Actual*
  </div>
</div>


        {/* {selectedPack && (
          <div className="mt-3 text-sm text-gray-700">
            <div>{selectedPack.label}</div>
            <div className="text-sm text-gray-600">@ ₹{(selectedPerPiece || 0).toFixed(2)}/piece</div>
          </div>
        )} */}
      </div>

      {/* Offers */}
      <div className="flex items-center gap-3 mt-4">
        <img src={offer} alt="Offer Icon" className="w-7 h-7" />
        <span className="text-base font-semibold text-[#1C647C]">Offers</span>
      </div>

     <div className="grid grid-cols-2 gap-4 mt-2">
        {[
          { title: "Bank Offers", details: "10% off with HDFC cards" },
          { title: "Partner Offers", details: "Flat ₹50 off via PhonePe" },
          { title: "Cashback", details: "₹14 cashback on Amazon Pay" },
          {
            title: "EMI options",
            details: "No Cost EMI on orders above ₹3,000",
          },
        ].map((offerObj) => (
          <div
            key={offerObj.title}
            className="flex flex-col justify-between w-[160px] h-[80px] rounded-lg border px-3 py-2 text-sm bg-gray-50"
          >
            <strong>{offerObj.title}</strong>
            <div className="text-xs text-gray-600 truncate">
              {offerObj.details}
              <p
                className="text-xs text-blue-600 cursor-pointer"
                onClick={() => setSelectedOffer(offerObj)}
              >
                2 Offers
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedOffer && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg border-l p-5 z-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{selectedOffer.title}</h2>
            <button
              className="text-gray-500 hover:text-red-500 text-xl font-bold"
              onClick={() => setSelectedOffer(null)}
            >
              &times;
            </button>
          </div>
          <p className="text-sm text-gray-700">{selectedOffer.details}</p>
        </div>
      )}

      
    </div>
  )
}
