import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { Product } from "@/Types/types";
import ProductCard from "./ProductCard";

type Status = "pending" | "error" | "success";

type Props = {
  products: Product[];
  status: Status;
  cardMode?: "default" | "medicop";
  cardVariant?: "default" | "medicop" | "mediqop";
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
  minimalHeader?: boolean;
};

export default function BestSellerShowcase({
  products,
  status,
  cardMode = "default",
  cardVariant,
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
  minimalHeader = false,
}: Props) {
  const resolvedCardMode =
    cardVariant === "mediqop" || cardVariant === "medicop"
      ? "medicop"
      : cardVariant === "default"
        ? "default"
        : cardMode;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [leftArrowLeft, setLeftArrowLeft] = useState<number>(20);

  const getMinOrder = (product: Product): number => {
    try {
      if (product.minmaxrule && typeof product.minmaxrule.minOrder === "number") {
        return product.minmaxrule.minOrder;
      }

      const bulkQtys: number[] =
        product.variants?.flatMap((variant: any) =>
          Array.isArray(variant.bulkOrders)
            ? variant.bulkOrders.map((bulk: any) => Number(bulk.qty || 0)).filter(Boolean)
            : []
        ) ?? [];

      if (bulkQtys.length > 0) return Math.min(...bulkQtys);
      return 1;
    } catch {
      return 1;
    }
  };

  const hasSufficientStock = (product: Product): boolean => {
    if (!product || !Array.isArray(product.variants) || product.variants.length === 0) {
      return false;
    }

    const minOrder = getMinOrder(product);
    const anyPositive = product.variants.some(
      (variant: any) => typeof variant.stock === "number" && variant.stock > 0
    );

    if (!anyPositive) return false;

    return product.variants.some(
      (variant: any) => typeof variant.stock === "number" && variant.stock >= minOrder
    );
  };

  const filteredItems = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter((product) => hasSufficientStock(product)).slice(0, maxItems);
  }, [products, maxItems]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const sectionElement = sectionRef.current;
    if (!scrollElement || !sectionElement) return;

    const check = () => {
      const maxScroll = Math.max(scrollElement.scrollWidth - scrollElement.clientWidth, 0);
      setShowLeft(scrollElement.scrollLeft > 5);
      setShowRight(scrollElement.scrollLeft < maxScroll - 5);

      try {
        const sectionRect = sectionElement.getBoundingClientRect();
        const scrollRect = scrollElement.getBoundingClientRect();
        const left = Math.max(8, Math.round(scrollRect.left - sectionRect.left + 8));
        setLeftArrowLeft(left);
      } catch {
        setLeftArrowLeft(20);
      }
    };

    check();
    scrollElement.addEventListener("scroll", check, { passive: true });
    const resizeObserver = new ResizeObserver(check);
    resizeObserver.observe(scrollElement);
    resizeObserver.observe(sectionElement);
    window.addEventListener("resize", check);

    return () => {
      scrollElement.removeEventListener("scroll", check);
      resizeObserver.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [filteredItems.length]);

  const scroll = (direction: "left" | "right") => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    const amount = Math.max(Math.round(scrollElement.clientWidth * 0.72), 300);
    scrollElement.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (status === "pending") {
    return (
      <section className="mb-12 w-full">
        <div
          className="rounded-2xl p-8 text-white"
          style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}
        >
          <div className="text-lg font-semibold">Loading products...</div>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="mb-12 w-full">
        <div
          className="rounded-2xl p-8 text-red-200"
          style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}
        >
          <div className="text-lg font-semibold">Failed to load products.</div>
        </div>
      </section>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <section className="mb-12 w-full">
        <div
          className="rounded-2xl p-8 text-white"
          style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}
        >
          <div className="text-lg">No products found.</div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative mb-16 w-full overflow-visible">
      <div
        className="flex flex-col items-start gap-4 overflow-hidden rounded-2xl p-4 sm:p-6 md:flex-row md:gap-5 lg:p-8"
        style={{ background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}
      >
        <div
          className="flex w-full flex-shrink-0 flex-col items-center gap-3 text-center md:w-56 md:items-start md:text-left"
          style={{ color: textColor }}
        >
          <div className="flex w-full items-center justify-between md:hidden">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg shadow"
                style={{ background: iconBg }}
                aria-hidden
              >
                {icon}
              </div>
              <h3 className="text-base font-extrabold leading-tight">{title}</h3>
            </div>

            <a
              href={viewAllLink}
              className="inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold"
              style={{ color: textColor }}
            >
              View All →
            </a>
          </div>

          <div className="hidden md:flex md:flex-col md:items-start md:gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg shadow"
                style={{ background: iconBg }}
                aria-hidden
              >
                {icon}
              </div>
              <h3 className="text-2xl font-extrabold leading-tight">{title}</h3>
            </div>

            <a
              href={viewAllLink}
              className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-md transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] ${
                minimalHeader ? "" : "mt-3"
              }`}
              style={{ background: accentBg, color: textColor }}
            >
              View All →
            </a>

            {!minimalHeader ? (
              <>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-white"
                  style={{ background: accentBg }}
                >
                  <span className="text-xs">₹</span>
                  {badgeText}
                </div>
                <p className="mt-1 text-sm opacity-90">{subText}</p>
                <p className="mt-1 text-xs opacity-80">Swipe → to explore products</p>
              </>
            ) : null}
          </div>
        </div>

        <div className="relative w-full flex-1">
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory items-start gap-3 overflow-x-auto scroll-smooth px-1 py-3 md:snap-none md:px-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`div::-webkit-scrollbar { display: none !important; }`}</style>

            {filteredItems.map((product) => (
              <div
                key={product._id}
                 className="min-w-0 max-w-[250px] flex-shrink-0 snap-center md:w-[250px] md:max-w-[250px] md:snap-start w-[70vw]"
              >
                <div className="bs-hover">
                  <ProductCard product={product} mode={resolvedCardMode} />
                </div>
              </div>
            ))}
            <div style={{ minWidth: 140 }} aria-hidden />
          </div>
        </div>
      </div>

      <button
        onClick={() => scroll("left")}
        aria-label="scroll left"
        className="absolute top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow transition-opacity hover:scale-105 md:flex"
        style={{
          left: leftArrowLeft,
          zIndex: 60,
          opacity: showLeft ? 1 : 0,
          pointerEvents: showLeft ? "auto" : "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="#2a0450"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        onClick={() => scroll("right")}
        aria-label="scroll right"
        className="absolute top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow transition-opacity hover:scale-105 md:flex"
        style={{
          right: 20,
          zIndex: 60,
          opacity: showRight ? 1 : 0,
          pointerEvents: showRight ? "auto" : "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18L15 12L9 6"
            stroke="#2a0450"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

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
