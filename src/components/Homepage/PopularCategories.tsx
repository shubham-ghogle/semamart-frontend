import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Now each category object contains:
 *  - link: string         -> where the image/title should go
 *  - items: { label, link }[] -> explicit link for each item
 */
const sampleCategories = [
  {
    id: "veg",
    title: "Vegetables & Fruits (Long title test to ensure clamp)",
    image: "/image60.png",
    link: "/category/veg",
    items: [
      { label: "Fresh Fruits", link: "/category/veg/fresh-fruits" },
      { label: "Fresh Vegetables", link: "/category/veg/fresh-vegetables" },
      { label: "Frozen Veg", link: "/category/veg/frozen-veg" },
      { label: "Leafies & Herbs", link: "/category/veg/leafies-herbs" },
      { label: "Mushrooms", link: "/category/veg/mushrooms" },
    ],
  },
  {
    id: "sea",
    title: "Seafood",
    image: "/image60.png",
    link: "/category/sea",
    items: [
      { label: "Fresh Fish", link: "/category/sea/fresh-fish" },
      { label: "Fresh Shellfish", link: "/category/sea/fresh-shellfish" },
      { label: "Frozen Fish", link: "/category/sea/frozen-fish" },
    ],
  },
  {
    id: "vegan",
    title: "Vegan Meat",
    image: "/placeholder.png",
    link: "/category/vegan",
    items: [
      { label: "Bacon", link: "/category/vegan/bacon" },
      { label: "Beef", link: "/category/vegan/beef" },
      { label: "Burgers", link: "/category/vegan/burgers" },
      { label: "Chicken", link: "/category/vegan/chicken" },
      { label: "Deli Meat", link: "/category/vegan/deli-meat" },
    ],
  },
  {
    id: "dairy",
    title: "Dairy",
    image: "/placeholder.png",
    link: "/category/dairy",
    items: [
      { label: "Butter", link: "/category/dairy/butter" },
      { label: "Cheese", link: "/category/dairy/cheese" },
      { label: "Eggs", link: "/category/dairy/eggs" },
      { label: "Milk & Cream", link: "/category/dairy/milk-cream" },
      { label: "Yogurt", link: "/category/dairy/yogurt" },
    ],
  },
  {
    id: "snacks",
    title: "Snacks",
    image: "/placeholder.png",
    link: "/category/snacks",
    items: [
      { label: "Chips", link: "/category/snacks/chips" },
      { label: "Cookies", link: "/category/snacks/cookies" },
      { label: "Bars", link: "/category/snacks/bars" },
      { label: "Trail Mix", link: "/category/snacks/trail-mix" },
      { label: "Nuts", link: "/category/snacks/nuts" },
      { label: "Biscuits", link: "/category/snacks/biscuits" },
    ],
  },
  {
    id: "drinks",
    title: "Beverages",
    image: "/placeholder.png",
    link: "/category/drinks",
    items: [
      { label: "Juice", link: "/category/drinks/juice" },
      { label: "Soda", link: "/category/drinks/soda" },
      { label: "Water", link: "/category/drinks/water" },
      { label: "Tea", link: "/category/drinks/tea" },
      { label: "Coffee", link: "/category/drinks/coffee" },
    ],
  },
];

export default function PopularCategories() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // state used for scrollbar indicator
  const [progress, setProgress] = useState(0);
  const [visibleFrac, setVisibleFrac] = useState(0.2);
  const [isDragging, setIsDragging] = useState(false);

  // movement detection (ref so listeners read latest)
  const movedRef = useRef(false);
  const startXRef = useRef<number | null>(null);
  const startLeftRef = useRef(0);

  const CARD_WIDTH = 320;
  const CARD_HEIGHT = 260;

  // update progress & visible fraction whenever layout/scroll changes
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

  // Drag handling WITHOUT pointer capture + click suppression after drag
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const MOVE_THRESHOLD = 6; // px - movement greater than this counts as drag

    // pointer handlers (works for mouse + touch with pointer events enabled)
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

    const onPointerUp = (_ev: PointerEvent) => {
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

  // click-on-track behavior (unchanged)
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

  return (
    <section className="w-full px-6 py-6">
      <div className="max-w-[1400px] mx-auto">
        {/* title: smaller and less heavy */}
        <h2 className="text-xl sm:text-2xl font-semibold text-[#1C170D] mb-4">
          Popular Categories
        </h2>

        <div className="h-1.5 w-28 rounded-full bg-[#f2efe9] mb-6" />

        {/* scroller */}
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

            /* subtle scrollbar for list inside cards */
            .cat-card .items-list::-webkit-scrollbar{height:6px;width:6px}
            .cat-card .items-list::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.08);border-radius:6px}
          `}</style>

          {sampleCategories.map((c) => (
            <div
              key={c.id}
              className="cat-card flex-shrink-0 bg-white rounded-xl p-4 shadow-sm flex gap-4 items-start"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                minWidth: CARD_WIDTH,
                boxSizing: "border-box",
                scrollSnapAlign: "start",
              }}
            >
              {/* Image column (image links to category) */}
              <div className="flex-shrink-0 flex items-start justify-center" style={{ minWidth: 128, width: 128 }}>
                <Link to={c.link} className="rounded-lg overflow-hidden flex items-center justify-center" aria-label={`Go to ${c.title}`}>
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
                      src={c.image}
                      alt={c.title}
                      className="w-full h-full object-contain p-3"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                  </div>
                </Link>
              </div>

              {/* Right text column */}
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="mb-2 cat-title-clamp">
                  <Link to={c.link} className="text-sm font-semibold text-[#1C170D] no-underline hover:no-underline transition-colors duration-150 hover:text-gray-400">
                    {c.title}
                  </Link>
                </h3>

                <div className="text-sm text-gray-500 overflow-auto items-list" style={{ maxHeight: 140 }}>
                  <ul className="flex flex-col">
                    {c.items.map((it, i) => (
                      <li key={i} className="py-2">
                        <Link to={it.link} className="inline-block no-underline hover:no-underline transition-colors duration-150 transform hover:translate-x-1 hover:text-[#16A34A]">
                          {it.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* slider track — viewport indicator segment (green) */}
        <div className="mt-4">
          <div
            ref={trackRef}
            className="relative rounded-full cursor-pointer"
            onClick={onTrackClick}
            style={{
              userSelect: "none",
              touchAction: "none",
              height: 6,
              background: "#ECFDF0", // pale green track
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
