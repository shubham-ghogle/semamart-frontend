import { BASE_URL } from "@/data";
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
  return (
    <section className="w-full px-6 py-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex gap-4 items-stretch">
          {/* LEFT: large slider */}
          <div className="relative rounded-xl overflow-hidden bg-white shadow-lg group min-w-0 flex-[3_1_0%] h-[12vh] sm:h-[34vh] md:h-[40vh] lg:h-[44vh]">
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {sliders.map((item, i) => (
                <Link
                  to={item.link}
                  key={i}
                  className="min-w-full h-full flex-shrink-0"
                >
                  <img
                    src={`${BASE_URL}images/${item.imagePath}`}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                    draggable={false}
                  />
                </Link>
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
                      current === i ? "bg-[#1C647C] scale-125" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT banners */}
          {rightBanners.map((item, i) => (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl min-w-0 flex-[1_1_0%] h-[12vh] sm:h-[34vh] md:h-[40vh] lg:h-[44vh]"
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
