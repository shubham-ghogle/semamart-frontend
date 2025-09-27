// ProductMediaSection.tsx
import React from "react";
import { PLACEHOLDER, toImageUrl } from "./utils";

export default function ProductMediaSection({
  product,
  productMedia,
  activeIdx,
  setActiveIdx,
  animating,
  setAnimating,
  selectedVariant,
  selectedPack,
  isVariantActive,
  setIsVariantActive,
}: any) {
  const handleThumbClick = (idx: number) => {
    if (activeIdx !== idx) {
      setIsVariantActive(false);
      setAnimating(true);
      setTimeout(() => {
        setActiveIdx(idx);
        setAnimating(false);
      }, 240);
    }
  };

  const displayOriginalPrice = selectedVariant?.originalPrice ?? (product as any)?.originalPrice;
  const displayDiscountPrice = selectedVariant?.discountPrice ?? (product as any)?.discountPrice;

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full max-w-[480px] h-[480px] rounded-xl bg-gray-50 flex items-center justify-center shadow-lg overflow-hidden relative mb-6"
        style={{ minHeight: "480px", maxHeight: "600px", marginLeft: "auto", marginRight: "auto" }}
      >
        {productMedia[activeIdx]?.type === "image" ? (
          <img
            src={isVariantActive && selectedVariant?.thumbnail ? toImageUrl(selectedVariant.thumbnail) : productMedia[activeIdx]?.src || PLACEHOLDER}
            alt={`${(product as any).name} - main`}
            className={`object-cover w-full h-full rounded-xl border border-gray-200 shadow transition-all duration-300 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            style={{ position: "absolute", top: 0, left: 0 }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
            }}
          />
        ) : (
          <video
            src={productMedia[activeIdx].src}
            controls
            className="object-contain w-full h-full rounded-xl border border-gray-200 shadow bg-black"
            style={{ position: "absolute", top: 0, left: 0 }}
          />
        )}

        {/* Discount badge top-right */}
        {(displayOriginalPrice || selectedVariant?.originalPrice) && (displayDiscountPrice || selectedVariant?.discountPrice) && (() => {
          const orig = selectedVariant?.originalPrice ?? displayOriginalPrice ?? 0;
          const disc = selectedVariant?.discountPrice ?? displayDiscountPrice ?? 0;
          const pct = orig ? Math.round(((orig - disc) / orig) * 100) : 0;
          if (pct <= 0) return null;
          return (
            <div style={{ position: "absolute", top: 12, right: 12 }}>
              <div className="px-3 py-1 rounded-sm border font-bold" style={{ borderColor: "#3bc177", color: "#3bc177", background: "rgba(255,255,255,0.9)" }}>
                {pct}% OFF
              </div>
            </div>
          );
        })()}
      </div>

      <div className="flex gap-4 mt-2 justify-center w-full overflow-x-auto px-2">
        {productMedia.map((m: any, idx: number) => (
          <button
            key={idx}
            onClick={() => handleThumbClick(idx)}
            className={`flex-none w-20 h-20 rounded-lg border-2 transition-all duration-200 overflow-hidden shadow ${activeIdx === idx ? "border-[#1C647C] scale-105" : "border-gray-200 opacity-80 hover:opacity-100"}`}
            style={{ background: "#fff", position: "relative" }}
          >
            {m.type === "image" ? (
              <img src={m.src || PLACEHOLDER} alt={`Thumbnail ${idx + 1}`} className="object-cover w-full h-full" onError={(e) => ((e.currentTarget as HTMLImageElement).src = PLACEHOLDER)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black text-white text-xs relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="opacity-90">
                    <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
                  </svg>
                </div>
                <div className="text-[10px] z-10">Video</div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
