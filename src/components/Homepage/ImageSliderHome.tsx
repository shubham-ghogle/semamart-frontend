import { useEffect, useState } from "react";

/**
 * ImageSliderHome
 * - left large slider (arrows appear on hover)
 * - two right small banners (subtle hover animation)
 */

const sliderImages = [
  "/Cover Photo/E1-1.png",
  "/Cover Photo/E1-2.png",
  "/Cover Photo/E1-4.png",
  "/Cover Photo/E1-3.png",
  "/placeholder.png",
];

const rightImageA = "/banner_Consumables.png";
const rightImageB = "/banner_Equipment.png";

export default function ImageSliderHome() {
  const [current, setCurrent] = useState(0);
  const total = sliderImages.length;

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % total), 3000);
    return () => clearInterval(t);
  }, [total]);

  const prev = () => setCurrent((p) => (p - 1 + total) % total);
  const next = () => setCurrent((p) => (p + 1) % total);

  return (
    <section className="w-full px-6 py-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr] gap-4 items-stretch">
          {/* LEFT: LARGE SLIDER */}
          <div className="relative rounded-xl overflow-hidden bg-white shadow-lg h-[40vh] sm:h-[42vh] lg:h-[44vh] group">
            {/* slider track */}
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{
                width: `${total * 100}%`,
                transform: `translateX(-${current * (100 / total)}%)`,
              }}
            >
              {sliderImages.map((src, i) => (
                <div key={i} className="min-w-full h-full flex items-center justify-center">
                  <img
                    src={src}
                    alt={`hero-${i}`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                </div>
              ))}
            </div>

            {/* arrows: become visible only when hovering the big card (.group:hover) */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <button
                onClick={prev}
                aria-label="previous"
                className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:-translate-x-0 -translate-x-1 hover:scale-105 focus:scale-105 bg-white rounded-full p-2 shadow-md"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {/* left chevron */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                  <path d="M15 6L9 12L15 18" stroke="#2b2b2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={next}
                aria-label="next"
                className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-0 translate-x-1 hover:scale-105 focus:scale-105 bg-white rounded-full p-2 shadow-md"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {/* right chevron */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                  <path d="M9 6L15 12L9 18" stroke="#2b2b2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* pilled dots indicator (centered bottom) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-white/95 px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                {sliderImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`go-to-${i}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
                      current === i ? "bg-[#1C647C] w-3.5 h-3.5" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SMALL BANNERS */}
          {[rightImageA, rightImageB].map((img, i) => (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden shadow-md h-[40vh] sm:h-[42vh] lg:h-[44vh] transition-shadow duration-300 hover:shadow-xl"
            >
              {/* subtle hover animation: slight lift + scale + smoother transition */}
              <a
                href="#"
                aria-label={`promo-${i}`}
                className="block w-full h-full transform-gpu transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-105 cursor-pointer"
              >
                <img
                  src={img}
                  alt={`promo-${i}`}
                  className="w-full h-full object-cover transform-gpu transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-1 will-change-transform"
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
