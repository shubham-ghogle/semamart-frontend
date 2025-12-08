// src/components/Homepage/BestSellerShowcase.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Product } from "@/Types/types";
import ProductCard from "./ProductCard";
import React from "react";

type Status = "pending" | "error" | "success";

type Props = {
  products: Product[];
  status: Status;

  title?: string;
  badgeText?: string;
  subText?: string;
  icon?: React.ReactNode;

  bgFrom?: string;
  bgTo?: string;
  iconBg?: string;
  accentBg?: string;
  textColor?: string;

  maxItems?: number;
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
  const sectionRef = useRef<HTMLElement | null>(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [leftArrowLeft, setLeftArrowLeft] = useState<number>(20);

  const items = useMemo(() => {
    const arr = Array.isArray(products) ? products : [];
    return arr.slice(0, maxItems);
  }, [products, maxItems]);

  useEffect(() => {
    const el = scrollRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;

    const check = () => {
      const maxScroll = Math.max(el.scrollWidth - el.clientWidth, 0);
      setShowLeft(el.scrollLeft > 5);
      setShowRight(el.scrollLeft < maxScroll - 5);

      try {
        const sectionRect = section.getBoundingClientRect();
        const scrollRect = el.getBoundingClientRect();
        const left = Math.max(8, Math.round(scrollRect.left - sectionRect.left + 8));
        setLeftArrowLeft(left);
      } catch {
        setLeftArrowLeft(20);
      }
    };

    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    ro.observe(section);
    window.addEventListener("resize", check);

    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [items.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(Math.round(el.clientWidth * 0.72), 300);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (status === "pending")
    return (
      <section className="w-full mb-12">
        <div className="rounded-2xl p-8 text-white" style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}>
          <div className="text-lg font-semibold">Loading Best Sellers…</div>
        </div>
      </section>
    );

  if (status === "error")
    return (
      <section className="w-full mb-12">
        <div className="rounded-2xl p-8 text-red-200" style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}>
          <div className="text-lg font-semibold">Failed to load best sellers.</div>
        </div>
      </section>
    );

  if (items.length === 0)
    return (
      <section className="w-full mb-12">
        <div className="rounded-2xl p-8 text-white" style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}>
          <div className="text-lg">No best sellers found.</div>
        </div>
      </section>
    );

  return (
    <section ref={sectionRef} className="w-full max-w-[1400px] mx-auto mb-16 relative overflow-visible">
      {/* Rounded content box */}
      <div
        className="
          rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row 
          gap-6 md:gap-5 items-start overflow-hidden
        "
        style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}
      >
        {/* LEFT BLOCK — improved on mobile */}
        <div
          className="
            flex-shrink-0 w-full md:w-56
            text-center md:text-left
            flex flex-col items-center md:items-start
            gap-3
          "
          style={{ color: textColor }}
        >
          <div className="flex items-center gap-3 md:gap-2">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shadow"
              style={{ background: iconBg }}
              aria-hidden
            >
              {icon}
            </div>

            <h3 className="text-2xl font-extrabold leading-tight">{title}</h3>
          </div>

          <div
            className="inline-flex items-center gap-2 text-white px-3 py-1 rounded-full text-sm font-semibold"
            style={{ background: accentBg }}
          >
            <span className="text-xs">₹</span>
            {badgeText}
          </div>

          <p className="mt-1 text-sm opacity-90">{subText}</p>

          {/* CTA optimized for mobile */}
          <a
            href={viewAllLink}
            className="
              mt-3 md:mt-4
              w-full md:w-auto
              inline-flex items-center justify-center
              px-5 py-3 rounded-xl font-semibold
              text-sm md:text-base
              shadow-md transition-transform duration-200
              hover:scale-[1.03] active:scale-[0.97]
            "
            style={{ background: accentBg, color: textColor }}
          >
            View All →
          </a>

          <p className="text-xs mt-1 opacity-80 md:hidden" style={{ color: textColor }}>
            Swipe → to explore products
          </p>
        </div>

        {/* RIGHT SWIPER */}
        <div className="relative flex-1 w-full">
          <div
            ref={scrollRef}
            className="
              flex gap-4 py-3 px-3 md:px-6 
              overflow-x-auto scroll-smooth items-start 
              snap-x snap-mandatory md:snap-none
            "
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`div::-webkit-scrollbar { display: none !important; }`}</style>

            {items.map((p) => (
              <div
                key={p._id}
                className="
                  flex-shrink-0 snap-center md:snap-start
                  w-[82vw] max-w-[320px]
                  md:w-[220px] md:max-w-[220px]
                  min-w-0
                "
              >
                <div className="bs-hover">
                  <ProductCard product={p} />
                </div>
              </div>
            ))}
            <div style={{ minWidth: 240 }} aria-hidden />
          </div>
        </div>
      </div>

      {/* ARROWS (desktop only) */}
      <button
        onClick={() => scroll("left")}
        aria-label="scroll left"
        className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 shadow hover:scale-105 transition-opacity"
        style={{
          left: leftArrowLeft,
          zIndex: 60,
          opacity: showLeft ? 1 : 0,
          pointerEvents: showLeft ? "auto" : "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#2a0450" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        onClick={() => scroll("right")}
        aria-label="scroll right"
        className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 shadow hover:scale-105 transition-opacity"
        style={{
          right: 20,
          zIndex: 60,
          opacity: showRight ? 1 : 0,
          pointerEvents: showRight ? "auto" : "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="#2a0450" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Hover style */}
      <style>{`
        .bs-hover {
          transition: transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms;
        }
        .bs-hover:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 28px rgba(10,8,20,0.16);
        }
      `}</style>
    </section>
  );
}
