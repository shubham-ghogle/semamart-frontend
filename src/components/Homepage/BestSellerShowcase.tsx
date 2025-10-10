// src/components/Homepage/BestSellerShowcase.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Product } from "@/Types/types";
import ProductCard from "./ProductCard";
import React from "react";

type Status = "pending" | "error" | "success";

type Props = {
  products: Product[];
  status: Status;

  /** Dynamic pieces */
  title?: string;
  badgeText?: string;
  subText?: string;
  icon?: React.ReactNode;

  /** Colors (can be any valid CSS color) */
  bgFrom?: string; // left/top gradient color
  bgTo?: string; // right/bottom gradient color
  iconBg?: string; // background color of the icon square
  accentBg?: string; // badge background
  textColor?: string; // primary text color in the left column

  /** Layout tweaks */
  mobileColumns?: number; // kept for API compatibility but ignored for mobile carousel
  maxItems?: number; // how many items to show (default 12)
};

export default function BestSellerShowcase({
  products,
  status,

  title = "Best Seller",
  badgeText = "Guaranteed discounts",
  subText = "Shop from our top-selling items.",
  icon,

  bgFrom = "#2a0450",
  bgTo = "#2a0450",
  iconBg = "#fbbf24",
  accentBg = "#ec4899",
  textColor = "#ffffff",

  // mobileColumns = 2,
  maxItems = 12,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const items = useMemo(() => {
  const arr = Array.isArray(products) ? products : [];
  return arr.slice(0, maxItems);
}, [products, maxItems]);
   
  useEffect(() => {
    const el = scrollRef.current;
    const checkScroll = () => {
      if (!el) {
        setShowLeft(false);
        setShowRight(false);
        return;
      }
      setShowLeft(el.scrollLeft > 5);
      setShowRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 1);
    };

    checkScroll();
    el?.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir: "left" | "right", amount = 360) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (status === "pending") {
    return (
      <section className="w-full mb-12" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="rounded-2xl p-8 text-white" style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}>
          <div className="text-lg font-semibold">Loading Best Sellers…</div>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="w-full mb-12" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="rounded-2xl p-8 text-red-200" style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}>
          <div className="text-lg font-semibold">Failed to load best sellers.</div>
        </div>
      </section>
    );
  }

  // memoized deterministic selection — take the first maxItems in incoming order



  if (items.length === 0) {
    return (
      <section className="w-full mb-12" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="rounded-2xl p-8 text-white" style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}>
          <div className="text-lg">No best sellers found.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[1400px] mx-auto mb-16">
      <div
        className="rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-5 items-start overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}
      >
        {/* Left info column - full width on mobile, fixed width on md+ */}
        <div className="flex-shrink-0 w-full md:w-56" style={{ color: textColor }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shadow"
              style={{ background: iconBg }}
              aria-hidden
            >
              {icon ?? (
                <svg width="20" height="16" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M2 14L6 6L10 14L14 4L18 14L22 6V16H2V14Z" fill="#3B0B68" />
                </svg>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-extrabold leading-tight" style={{ color: textColor }}>
                {title}
              </h3>
            </div>
          </div>

          <div className="mt-3 md:mt-4">
            <div
              className="inline-flex items-center gap-2 text-white px-3 py-1 rounded-full text-sm font-semibold"
              style={{ background: accentBg }}
            >
              <span className="text-xs">₹</span>
              <span>{badgeText}</span>
            </div>
          </div>

          <p className="mt-4 text-sm" style={{ color: `${lightenHex(textColor, 0.25)}` }}>
            {subText}
          </p>
        </div>

        {/* Right area */}
        <div className="relative flex-1 w-full">
          {/* Left button (visible on all breakpoints, smaller on mobile) */}
          <button
            onClick={() => scroll("left", 300)}
            aria-label="scroll left"
            className={`absolute z-20 left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30 md:left-2 md:w-10 md:h-10 ${
              showLeft ? "opacity-100 scale-100" : "opacity-0 pointer-events-none scale-95"
            }`}
          >
            <svg className="rotate-180" width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M8 5L16 12L8 19" stroke="#2a0450" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Mobile: single-card carousel (snap) */}
          <div
            ref={scrollRef}
            className="flex md:hidden gap-4 py-3 px-4 overflow-x-auto scroll-smooth items-start snap-x snap-mandatory"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <style>{`div::-webkit-scrollbar{ display: none !important; }`}</style>

            {items.map((p) => (
              <div
                key={p._id}
                className="flex-shrink-0 snap-center w-[calc(100%-48px)] max-w-[420px] min-w-0"
                aria-hidden={false}
              >
                <div className="bs-hover" style={{ willChange: "transform, box-shadow" }}>
                  <ProductCard product={p} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/tablet: original horizontal scroll list (unchanged) */}
          <div
            className="hidden md:flex gap-6 py-2 px-6 overflow-x-auto scroll-smooth items-start"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <style>{`div::-webkit-scrollbar{ display: none !important; }`}</style>

            {items.map((p) => (
              <div key={p._id} className="flex-shrink-0 min-w-[220px] max-w-[220px]">
                <div className="bs-hover" style={{ willChange: "transform, box-shadow" }}>
                  <ProductCard product={p} />
                </div>
              </div>
            ))}
          </div>

          {/* Right button (visible on all breakpoints) */}
          <button
            onClick={() => scroll("right", 300)}
            aria-label="scroll right"
            className={`absolute z-20 right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30 md:right-2 md:w-10 md:h-10 ${
              showRight ? "opacity-100 scale-100" : "opacity-0 pointer-events-none scale-95"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M8 5L16 12L8 19" stroke="#2a0450" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Subtle hover effect CSS (gentle lift + tiny scale) and mobile fixes */}
      <style>{`
        .bs-hover {
          transition: transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms;
          display: block;
        }
        .bs-hover:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 28px rgba(10,8,20,0.16);
        }
        /* Ensure inner card fills wrapper and images don't force overflow */
        .bs-hover > * {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: block;
        }
        .bs-hover img {
          max-width: 100%;
          height: auto;
          object-fit: cover;
          display: block;
        }
        @media (prefers-reduced-motion: reduce) {
          .bs-hover { transition: none !important; }
          .bs-hover:hover { transform: none !important; box-shadow: none !important; }
        }
      `}</style>
    </section>
  );
}

/**
 * tiny helper to lighten hex colors for the subText color fallback.
 * Accepts hex like #fff or #123456. If parsing fails returns 'rgba(255,255,255,0.85)'.
 */
function lightenHex(hex: string, amount = 0.2) {
  try {
    const h = hex.replace("#", "");
    const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
    const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16);
    const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16);
    const nr = Math.min(255, Math.round(r + (255 - r) * amount));
    const ng = Math.min(255, Math.round(g + (255 - g) * amount));
    const nb = Math.min(255, Math.round(b + (255 - b) * amount));
    return `rgb(${nr} ${ng} ${nb} / 0.85)`;
  } catch {
    return "rgba(255,255,255,0.85)";
  }
}
