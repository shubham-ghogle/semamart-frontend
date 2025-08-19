import { useRef, useState, useEffect } from "react";
import { Product } from "../../Types/types";
import EquipmentProductCard from "../Product/EquipmentProductCard.tsx";

type ProductShowcaseProps = {
  status: "error" | "success" | "pending";
  title: string;
  products: Product[];
};

export default function ProductShowcase({
  status,
  title,
  products,
}: ProductShowcaseProps) {
  const container = "w-full mb-16";
  const header = "text-2xl font-bold font-jakarta text-[#1C170D] mb-4 pl-4";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 260; // width of one card + gap
    el.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (status === "pending") {
    return (
      <article className={container}>
        <h2 className={header}>{title}</h2>
        <div className="h-80 text-xl grid place-items-center">Loading…</div>
      </article>
    );
  }

  if (status === "error") {
    return (
      <article className={container}>
        <h2 className={header}>{title}</h2>
        <div className="h-80 text-red-500 grid place-items-center">
          Failed to load products.
        </div>
      </article>
    );
  }

  const shuffled = products.slice().sort(() => 0.5 - Math.random());
  const items = shuffled.slice(0, 12);

  return (
    <article className={container}>
      <h2 className={header}>{title}</h2>

      {items.length === 0 ? (
        <div className="h-80 flex justify-center items-center text-secondary text-lg">
          No Data Found
        </div>
      ) : (
        <div className="relative w-full flex items-center">
          {/* Left Arrow */}
          {showLeft && (
            <button
              onClick={() => scroll("left")}
              className="flex-shrink-0 w-12 h-[170px] bg-gray-200 text-3xl font-bold flex items-center justify-center rounded-r-md hover:bg-gray-300"
            >
              &lt;
            </button>
          )}

          {/* Scrollable Product Row */}
          <div
            ref={scrollRef}
            className="flex gap-4 px-4 pb-2 overflow-x-auto scroll-smooth"
            style={{
              minHeight: "340px",
              msOverflowStyle: "none", // IE + Edge
              scrollbarWidth: "none", // Firefox
            }}
          >
            {items.map((product) => (
              <div
                key={product._id}
                className="min-w-[200px] max-w-[240px] flex-shrink-0"
              >
                <EquipmentProductCard product={product} variant="default" />
              </div>
            ))}

            {/* Force-hide Chrome/Safari scrollbar */}
            <style>{`
              div::-webkit-scrollbar {
                display: none !important;
              }
            `}</style>
          </div>

          {/* Right Arrow */}
          {showRight && (
            <button
              onClick={() => scroll("right")}
              className="flex-shrink-0 w-12 h-[170px] bg-gray-200 text-3xl font-bold flex items-center justify-center rounded-l-md hover:bg-gray-300"
            >
              &gt;
            </button>
          )}
        </div>
      )}
    </article>
  );
}
