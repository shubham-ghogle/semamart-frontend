import { useState } from "react";
import offer from "../../../public/offer.png";
import { AiOutlineCheckCircle } from "react-icons/ai";

export default function ProductInfoSection({
  product,
  selectedVariant,
  minOrderQty,
}: any) {
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const displayOriginalPrice =
    selectedVariant?.originalPrice ?? product?.originalPrice;
  const displayDiscountPrice =
    selectedVariant?.discountPrice ?? product?.discountPrice;

  const mainPrice = displayDiscountPrice ?? displayOriginalPrice ?? 0;

  const safeNumber = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const moq = safeNumber(minOrderQty ?? product?.minOrderQty ?? 0);
  const stock = Number(selectedVariant?.stock ?? 0);
  const isOutOfStock = moq > 0 && stock < moq;

  const perPiecePrice = safeNumber(
    selectedVariant?.discountPrice ??
      selectedVariant?.originalPrice ??
      product?.discountPrice ??
      product?.originalPrice
  );

  const moqTotal = safeNumber(perPiecePrice * moq);

  let topDiscount = 0;
  if (displayOriginalPrice && displayDiscountPrice) {
    topDiscount = Math.round(
      ((displayOriginalPrice - displayDiscountPrice) /
        Math.max(displayOriginalPrice, 1)) *
        100
    );
  }

  const offers = [
    { title: "Bank Offers", details: "10% off with HDFC cards" },
    { title: "Partner Offers", details: "Flat ₹50 off via PhonePe" },
    { title: "Cashback", details: "₹14 cashback on Amazon Pay" },
    { title: "EMI options", details: "No Cost EMI on orders above ₹3,000" },
  ];

  const brandText =
    product?.brand && typeof product.brand === "string"
      ? product.brand
      : product?.brand?.name || null;

  return (
    <div className="w-full max-w-md bg-white rounded-lg p-4 shadow-lg space-y-6 mx-auto min-h-[600px] relative">
      <h2 className="text-black break-words text-[24px] leading-[32px] font-manrope">
        {product?.name}
      </h2>

      {brandText && (
        <div className="text-sm font-semibold text-slate-700">
          Brand: <span className="text-black">{brandText}</span>
        </div>
      )}

      <div className="flex items-center text-base text-gray-500 gap-3">
        <div className="text-yellow-400 text-xl">
          {"★".repeat(3)}
          {"☆".repeat(2)}
        </div>
        {product?.reviews?.length > 0 && <span>({product.reviews.length} reviews)</span>}
      </div>

      <div className="mt-2">
        <div className="flex items-baseline gap-3 mt-2 flex-wrap">
          <span className="text-3xl font-bold text-[#FB9573]">
            ₹{mainPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          {displayOriginalPrice && displayDiscountPrice && (
            <span className="text-gray-400 text-base line-through">
              ₹
              {displayOriginalPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          )}
          {topDiscount > 0 && (
            <span className="text-green-600 font-semibold text-base">
              {topDiscount}% off
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-2">
          <div className="text-sm text-gray-500 whitespace-nowrap">
            Price Excluding GST
          </div>

          <div
            className="mt-2 sm:mt-0 flex items-center justify-center whitespace-nowrap"
            style={{
              height: 32,
              paddingLeft: 12,
              paddingRight: 20,
              background: "yellow",
              fontWeight: 600,
              clipPath:
                "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)",
              borderRadius: 8,
            }}
          >
            Shipping Charge at Actual*
          </div>
        </div>
      </div>

      {isOutOfStock ? (
        <div className="mt-4 p-4 rounded-2xl border border-red-200 bg-red-50 text-center">
          <div className="text-lg font-bold text-red-600">Out of Stock</div>
          <div className="text-sm text-red-500 mt-1">Minimum order: {moq} pcs</div>
        </div>
      ) : (
        moq > 0 && (
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#E6F6F8] bg-[#F7FFFE] shadow-sm mt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E8F5F8] flex items-center justify-center">
                <AiOutlineCheckCircle className="text-[#0F666D] text-2xl" />
              </div>
              <span className="text-sm text-slate-700 font-medium">
                Minimum Order Quantity
              </span>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">{moq} pcs</div>
              <div className="text-xs text-slate-600 mt-1">
                ₹{perPiecePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })} each ·{" "}
                <span className="font-semibold">
                  ₹{moqTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )
      )}

      <div>
        <div className="flex items-center gap-3 mt-4">
          <img src={offer} alt="Offer Icon" className="w-7 h-7" />
          <span className="text-base font-semibold text-[#1C647C]">Offers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {offers.map((offerObj) => (
            <div
              key={offerObj.title}
              className="flex flex-col justify-between w-full rounded-lg border px-3 py-2 text-sm bg-gray-50"
            >
              <strong>{offerObj.title}</strong>
              <div className="text-xs text-gray-600 truncate">
                {offerObj.details}
                <p
                  className="text-xs text-blue-600 cursor-pointer mt-1"
                  onClick={() => setSelectedOffer(offerObj)}
                >
                  2 Offers
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedOffer && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg border-l p-5 z-50 overflow-auto transition-transform duration-300">
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
  );
}
