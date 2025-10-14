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
  maxItems?: number; // how many items to show (default 12)

  /** View all button link (optional). Defaults to /products when not provided */
  viewAllLink?: string;
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

  maxItems = 12,
  viewAllLink = "/products",
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const items = useMemo(() => {
    const arr = Array.isArray(products) ? products : [];
    return arr.slice(0, maxItems);
  }, [products, maxItems]);

  // checks whether left/right arrows should be shown
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      setShowLeft(false);
      setShowRight(false);
      return;
    }

    const checkScroll = () => {
      const maxScroll = Math.max(el.scrollWidth - el.clientWidth, 0);
      setShowLeft(el.scrollLeft > 5);
      // show right if we are not at the far-right
      setShowRight(el.scrollLeft < maxScroll - 1);
    };

    // initial
    checkScroll();

    // listeners
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
    // note: items.length influences layout; we intentionally watch it in the outer hook deps
  }, [items.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // adaptive amount: most of visible area (keyboard-friendly)
    const amount = Math.max(Math.round(el.clientWidth * 0.72), 300);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (status === "pending") {
    return (
      <section className="w-full mb-12" style={{ fontFamily: "var(--font-sans)" }}>
        <div
          className="rounded-2xl p-8 text-white"
          style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}
        >
          <div className="text-lg font-semibold">Loading Best Sellers…</div>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="w-full mb-12" style={{ fontFamily: "var(--font-sans)" }}>
        <div
          className="rounded-2xl p-8 text-red-200"
          style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}
        >
          <div className="text-lg font-semibold">Failed to load best sellers.</div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="w-full mb-12" style={{ fontFamily: "var(--font-sans)" }}>
        <div
          className="rounded-2xl p-8 text-white"
          style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}
        >
          <div className="text-lg">No best sellers found.</div>
        </div>
      </section>
    );
  }

  return (
    // Make section relative & overflow-visible so arrows can sit outside the rounded box
    <section className="w-full max-w-[1400px] mx-auto mb-16 relative overflow-visible">
      {/* Rounded content box: keep overflow-hidden so the rounded corners stay crisp */}
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
                <svg
                  width="20"
                  height="16"
                  viewBox="0 0 24 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
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

          {/* VIEW ALL button: responsive (full-width on mobile, inline on md+) */}
          <div className="mt-5 md:mt-6">
            <a
              href={viewAllLink}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-transform duration-150 focus:outline-none focus:ring-4"
              style={{
                background: accentBg,
                color: textColor,
                width: "100%",
                display: "inline-flex",
                textDecoration: "none",
                justifyContent: "center",
              }}
              aria-label="View all best sellers"
            >
              View All
            </a>
          </div>
        </div>

        {/* Right area */}
        <div className="relative flex-1 w-full">
          <div
            ref={scrollRef}
            className="flex gap-4 py-3 px-4 md:py-2 md:px-6 overflow-x-auto scroll-smooth items-start snap-x snap-mandatory md:snap-none"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              paddingRight: 96,
              scrollPaddingRight: 96,
            }}
          >
            <style>{`div::-webkit-scrollbar{ display: none !important; }`}</style>

            {items.map((p) => (
              <div
                key={p._id}
                // responsive card sizing:
                // - mobile: near full width snap card (w-[calc(100%-48px)] up to max-w-[420px])
                // - md+: fixed card width (220px) so many cards don't overflow the viewport
                className="flex-shrink-0 snap-center md:snap-start w-[calc(100%-24px)] max-w-[520px] md:w-[220px] md:max-w-[220px] min-w-0"
              >
                <div className="bs-hover" style={{ willChange: "transform, box-shadow" }}>
                  <ProductCard product={p} />
                </div>
              </div>
            ))}

            {/* end spacer: make it at least one card wide so final card never touches container edge */}
            <div style={{ minWidth: 240 }} aria-hidden />
          </div>
        </div>
      </div>

      {/* ARROWS: placed as siblings of the rounded box (inside section), so they are not clipped.
          They are hidden by opacity:0 when not needed (no faint dot). */}
      <button
        onClick={() => scroll("left")}
        aria-label="scroll left"
        className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 shadow transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
        style={{
          left: 20,
          zIndex: 60,
          opacity: showLeft ? 1 : 0,
          pointerEvents: showLeft ? "auto" : "none",
          transform: showLeft ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(-6px)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#2a0450" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        onClick={() => scroll("right")}
        aria-label="scroll right"
        className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 shadow transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
        style={{
          right: 20,
          zIndex: 60,
          opacity: showRight ? 1 : 0,
          pointerEvents: showRight ? "auto" : "none",
          transform: showRight ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(6px)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="#2a0450" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <style>{`
        .bs-hover {
          transition: transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms;
          display: block;
        }
        .bs-hover:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 28px rgba(10,8,20,0.16);
        }
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
