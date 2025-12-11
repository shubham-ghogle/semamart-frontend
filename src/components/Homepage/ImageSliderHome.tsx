import { useEffect, useRef, useState } from "react";

type Banner = {
  name: string;
  link: string;
  imagePath: string;
};

/* ================= NORMALIZE IMAGE ================= */
const normalizeImage = (src?: string | null) => {
  if (!src) return "/placeholder.png";

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  ) {
    return src;
  }

  return `/hero/${src}`;
};

/* ================= SKELETON LOADER ================= */
const Skeleton = ({ className }: { className?: string }) => {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
};

/* ================= COMPONENT ================= */
export default function ImageSliderHome() {
  const [sliders, setSliders] = useState<Banner[]>([]);
  const [rightBanners, setRightBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  const intervalRef = useRef<number | null>(null);

  /* ================= FETCH HERO DATA ================= */
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/v2/heroslider/getallimg");
        if (!res.ok) throw new Error("Hero API failed");

        const json = await res.json();
        const hero = json?.data?.[0];
        if (!hero) return;

        setSliders(hero.sliders || []);

        const rightSide: Banner[] = [];
        if (hero.leftBanner) rightSide.push(hero.leftBanner);
        if (hero.rightBanner) rightSide.push(hero.rightBanner);
        setRightBanners(rightSide);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHero();
  }, []);

  const total = sliders.length;

  /* ================= AUTO SLIDE ================= */
  useEffect(() => {
    if (total <= 1) return;

    intervalRef.current = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 3000);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [total]);

  const prev = () => setCurrent((p) => (p - 1 + total) % total);
  const next = () => setCurrent((p) => (p + 1) % total);

  /* ================= LOADING SKELETON ================= */
  if (!sliders.length) {
    return (
      <section className="w-full px-6 py-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr] gap-4 items-stretch">
            <Skeleton className="h-[40vh] sm:h-[42vh] lg:h-[44vh]" />
            <Skeleton className="h-[40vh] sm:h-[42vh] lg:h-[44vh]" />
            <Skeleton className="h-[40vh] sm:h-[42vh] lg:h-[44vh]" />
          </div>
        </div>
      </section>
    );
  }

  /* ================= UI ================= */
  return (
    <section className="w-full px-6 py-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr] gap-4 items-stretch">
          {/* ----------------- LEFT: LARGE SLIDER ----------------- */}
          <div className="relative rounded-xl overflow-hidden bg-white shadow-lg h-[40vh] sm:h-[42vh] lg:h-[44vh] group">
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${current * 100}%)`,
                width: `${total * 100}%`,
              }}
            >
              {sliders.map((item, i) => (
                <div key={i} className="flex-shrink-0 w-full h-full">
                  <a
                    href={item.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <img
                      src={normalizeImage(item.imagePath)}
                      alt={item.name || "Hero Slider"}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />
                  </a>
                </div>
              ))}
            </div>

            {/* ARROWS */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <button
                onClick={prev}
                className="pointer-events-auto opacity-0 group-hover:opacity-100 transition bg-white rounded-full p-2 shadow"
              >
                ‹
              </button>

              <button
                onClick={next}
                className="pointer-events-auto opacity-0 group-hover:opacity-100 transition bg-white rounded-full p-2 shadow"
              >
                ›
              </button>
            </div>

            {/* DOTS */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="bg-white/95 px-3 py-1 rounded-full flex gap-2 shadow-sm">
                {sliders.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      current === i
                        ? "bg-[#1C647C] scale-125"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ----------------- RIGHT SIDE SMALL BANNERS ----------------- */}
          {rightBanners.map((item, i) => (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden shadow-md h-[40vh] sm:h-[42vh] lg:h-[44vh] hover:shadow-xl"
            >
              <a
                href={item.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full transform transition-transform duration-500 group-hover:scale-105"
              >
                <img
                  src={normalizeImage(item.imagePath)}
                  alt={item.name || "Banner"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
