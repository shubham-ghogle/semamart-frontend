import { API_URL, BASE_URL } from "@/data";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

type Banner = {
  name: string;
  link: string;
  imagePath: string;
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

  // track small-screen state (matches Tailwind "sm" breakpoint)
  const [isMobile, setIsMobile] = useState(false);

  // intervalRef holds the ID returned by window.setInterval
  const intervalRef = useRef<number | null>(null);

  /* ================= HANDLE RESIZE / MEDIA QUERY ================= */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)"); // Tailwind sm = 640px

    // Accept both MediaQueryList and MediaQueryListEvent
    const update = (e: MediaQueryList | MediaQueryListEvent) => {
      // both types expose `matches`
      setIsMobile((e as MediaQueryList).matches);
    };

    // initial value
    update(mq);

    // prefer modern API, fallback to legacy - use runtime typeof checks to avoid TS narrowing issues
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update as (ev: MediaQueryListEvent) => void);
    } else if (typeof (mq as any).addListener === "function") {
      // legacy browsers
      (mq as any).addListener(update);
    }

    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", update as (ev: MediaQueryListEvent) => void);
      } else if (typeof (mq as any).removeListener === "function") {
        (mq as any).removeListener(update);
      }
    };
  }, []);

  /* ================= FETCH HERO DATA ================= */
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(API_URL + "heroslider/getheroimg");
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
    // clear previous interval if exists
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (total <= 1) return;

    intervalRef.current = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 3000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [total]);

  const prev = () => setCurrent((p) => (p - 1 + total) % total);
  const next = () => setCurrent((p) => (p + 1) % total);

  /* ================= LOADING SKELETON ================= */
  if (!sliders.length) {
    return (
      <section className="w-full px-6 py-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex gap-4 items-stretch">
            <Skeleton className="min-w-0 flex-[3_1_0%] h-[12vh] sm:h-[34vh] md:h-[40vh] lg:h-[44vh]" />
            <Skeleton className="min-w-0 flex-[1_1_0%] h-[12vh] sm:h-[34vh] md:h-[40vh] lg:h-[44vh]" />
            <Skeleton className="min-w-0 flex-[1_1_0%] h-[12vh] sm:h-[34vh] md:h-[40vh] lg:h-[44vh]" />
          </div>
        </div>
      </section>
    );
  }

  /* ================= UI ================= */
  // proportions derived from 1440 : 450 : 450
  const leftPct = "61.538%"; // 1440 / (1440+450+450)
  const rightPct = "19.231%"; // 450 / total

  return (
    <section className="w-full px-12 py-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex gap-4 items-stretch">
          {/* LEFT: large slider */}
          <div
            /* keep width proportion and aspect ratio; on mobile expand to full width */
            style={{
              flex: isMobile ? "1 1 0%" : `0 0 ${leftPct}`,
              aspectRatio: isMobile ? "16/9" : "1440/550",
            }}
            className="relative rounded-xl overflow-hidden bg-white shadow-lg group min-w-0"
          >
            {/* TRACK: width = slides.length * 100% */}
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{
                width: `${sliders.length * 100}%`,
                transform: `translateX(-${(current * 100) / sliders.length}%)`,
              }}
            >
              {sliders.map((item, i) => (
                <Link
                  to={item.link}
                  key={i}
                  className="flex-shrink-0 h-full"
                  style={{ width: `${100 / sliders.length}%` }}
                >
                  <img
                    src={`${BASE_URL}images/${item.imagePath}`}
                    alt={item.name}
                    className="h-full w-full object-cover object-center block"
                    draggable={false}
                  />
                </Link>
              ))}
            </div>

            {/* ARROWS */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <button
                type="button"
                onClick={prev}
                className="pointer-events-auto opacity-0 group-hover:opacity-100 transition bg-white rounded-full p-2 shadow"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={next}
                className="pointer-events-auto opacity-0 group-hover:opacity-100 transition bg-white rounded-full p-2 shadow"
                aria-label="Next slide"
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
                    type="button"
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      current === i ? "bg-[#1C647C] scale-125" : "bg-gray-300"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT banners - hidden on mobile */}
          {!isMobile &&
            rightBanners.map((item, i) => (
              <div
                key={i}
                style={{ flex: `0 0 ${rightPct}`, aspectRatio: "450/550" }}
                className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl min-w-0"
              >
                <a
                  href={item.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                >
                  <img
                    src={BASE_URL + "images/" + item.imagePath}
                    alt={item.name || "Banner"}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    draggable={false}
                  />
                </a>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
