import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function PopularCategories() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [visibleFrac, setVisibleFrac] = useState(0.2);
  const [isDragging, setIsDragging] = useState(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const movedRef = useRef(false);
  const startXRef = useRef<number | null>(null);
  const startLeftRef = useRef(0);

  const CARD_WIDTH = 320;
  const CARD_GAP = 16;
  const CARD_HEIGHT = 260;

  // ---------------------- FETCH CATEGORIES + SUBCATEGORIES ----------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Fetch all categories
        const res = await fetch("/api/v2/category/");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const categoriesData = await res.json();

        // 2️⃣ For each category, fetch subcategories
        const categoriesWithSubs = await Promise.all(
          categoriesData.map(async (cat: any) => {
            try {
              const subRes = await fetch(`/api/v2/category/${cat._id}/subcategories`);
              if (!subRes.ok) throw new Error(`Failed subcategories for ${cat._id}`);
              const subData = await subRes.json();
              return { ...cat, subcategories: subData || [] };
            } catch (subErr) {
              console.warn("Subcategory fetch failed for", cat._id, subErr);
              return { ...cat, subcategories: [] };
            }
          })
        );

        setCategories(categoriesWithSubs);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ---------------------- SCROLL PROGRESS ----------------------
  useEffect(() => {
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const update = () => {
      const totalScroll = Math.max(el.scrollWidth - el.clientWidth, 0);
      const p = totalScroll === 0 ? 0 : el.scrollLeft / totalScroll;
      setProgress(Math.max(0, Math.min(1, p)));
      const vf = Math.min(1, el.clientWidth / Math.max(el.scrollWidth, 1));
      setVisibleFrac(vf);

      setCanScrollLeft(el.scrollLeft > 1);
      setCanScrollRight(el.scrollLeft < totalScroll - 1);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    ro.observe(track);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // ---------------------- DRAG SCROLL ----------------------
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const MOVE_THRESHOLD = 6;

    const onPointerDown = (ev: PointerEvent) => {
      if (ev.isPrimary === false) return;
      startXRef.current = ev.clientX;
      startLeftRef.current = el.scrollLeft;
      movedRef.current = false;
      setIsDragging(true);
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (startXRef.current === null) return;
      const dx = startXRef.current - ev.clientX;
      if (Math.abs(dx) > MOVE_THRESHOLD) movedRef.current = true;
      el.scrollLeft = Math.round(startLeftRef.current + dx);
    };

    const onPointerUp = () => {
      startXRef.current = null;
      setIsDragging(false);
      setTimeout(() => {
        movedRef.current = false;
      }, 0);
    };

    const onClickCapture = (ev: MouseEvent) => {
      if (movedRef.current) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  // ---------------------- SCROLLBAR CLICK ----------------------
  const onTrackClick = (e: React.MouseEvent) => {
    const track = trackRef.current;
    const scroller = scrollerRef.current;
    if (!track || !scroller) return;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const p = Math.min(1, Math.max(0, clickX / track.clientWidth));
    const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
    scroller.scrollTo({ left: Math.round(p * maxScroll), behavior: "smooth" });
  };

  const leftPercent = Math.max(0, Math.min(100, progress * (1 - visibleFrac) * 100));
  const widthPercent = Math.max(visibleFrac * 100, 6);

  const scrollBy = (delta: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const onClickLeft = () => scrollBy(-(CARD_WIDTH + CARD_GAP));
  const onClickRight = () => scrollBy(CARD_WIDTH + CARD_GAP);

  // ---------------------- RENDER ----------------------
  return (
    <section className="w-full px-6 py-6">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#1C170D] mb-4">
          Popular Categories
        </h2>

        <div className="h-1.5 w-28 rounded-full bg-[#f2efe9] mb-6" />

        <div className="relative">
          {/* Scroll Buttons */}
          <button
            aria-label="Scroll left"
            onClick={onClickLeft}
            className={`${canScrollLeft ? "md:flex" : "md:hidden"} hidden items-center justify-center absolute z-10 top-1/2 transform -translate-y-1/2 left-2 w-9 h-9 rounded-full shadow-sm bg-white`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            aria-label="Scroll right"
            onClick={onClickRight}
            className={`${canScrollRight ? "md:flex" : "md:hidden"} hidden items-center justify-center absolute z-10 top-1/2 transform -translate-y-1/2 right-2 w-9 h-9 rounded-full shadow-sm bg-white`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* SCROLLER */}
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto pb-3 scroll-smooth"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              touchAction: "pan-x",
              scrollSnapType: "x mandatory",
            }}
          >
            <style>{`
              .scroll-smooth::-webkit-scrollbar { display: none; }
              .cat-title-clamp {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
              .cat-card .items-list::-webkit-scrollbar{height:6px;width:6px}
              .cat-card .items-list::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.08);border-radius:6px}
            `}</style>

            {loading && (
              <div className="text-gray-400 text-center py-8 w-full">
                Loading categories...
              </div>
            )}

            {error && (
              <div className="text-red-500 text-center py-8 w-full">
                {error}
              </div>
            )}

            {!loading && !error && categories.length > 0 && categories.map((c) => (
              <div
                key={c._id}
                className="cat-card flex-shrink-0 bg-white rounded-xl p-4 shadow-sm flex gap-4 items-start"
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  minWidth: CARD_WIDTH,
                  boxSizing: "border-box",
                  scrollSnapAlign: "start",
                }}
              >
                <div className="flex-shrink-0 flex items-start justify-center" style={{ minWidth: 128, width: 128 }}>
                  <Link
                    to={`/category/${c._id}`}
                    className="rounded-lg overflow-hidden flex items-center justify-center"
                    aria-label={`Go to ${c.name}`}
                  >
                    <div
                      style={{
                        width: 112,
                        height: 184,
                        background: "rgba(0,0,0,0.03)",
                        borderRadius: 12,
                      }}
                      className="flex items-center justify-center"
                    >
                      <img
                        src={c.image || "/placeholder.png"}
                        alt={c.name}
                        className="w-full h-full object-contain p-3"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                      />
                    </div>
                  </Link>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <h3 className="mb-2 cat-title-clamp">
                    <Link
                       to={`/get-products-by-category/${c._id}`}
                      className="text-sm font-semibold text-[#1C170D] no-underline hover:no-underline transition-colors duration-150 hover:text-gray-400"
                    >
                      {c.name}
                    </Link>
                  </h3>

                  <div className="text-sm text-gray-500 overflow-auto items-list" style={{ maxHeight: 140 }}>
                    <ul className="flex flex-col">
                      {c.subcategories && c.subcategories.length > 0 ? (
                        c.subcategories.map((sub: any) => (
                          <li key={sub._id} className="py-2">
                            <Link
                              to={`/get-products-by-subcategory/${sub._id}`}
                              className="inline-block no-underline hover:no-underline transition-colors duration-150 transform hover:translate-x-1 hover:text-[#16A34A]"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="py-2 text-gray-400">No subcategories</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-4">
          <div
            ref={trackRef}
            className="relative rounded-full cursor-pointer"
            onClick={onTrackClick}
            style={{
              userSelect: "none",
              touchAction: "none",
              height: 6,
              background: "#ECFDF0",
            }}
          >
            <div
              className={`absolute top-0 rounded-full transition-all duration-150 ${isDragging ? "opacity-90" : "opacity-100"}`}
              style={{
                height: "100%",
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                background: "#16A34A",
                transformOrigin: "left",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
