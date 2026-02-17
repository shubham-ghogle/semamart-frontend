import { API_URL, BASE_URL } from "@/data";
import { useEffect, useState } from "react";

type BannerSide = {
  name: string;
  image: string;
  link: string;
};

type BannerItem = {
  title?: string;
  left: BannerSide;
  right: BannerSide;
};

type BannerSectionProps = {
  className?: string;
  bannerIndex?: number;
};

/* ================= SKELETON LOADER ================= */
const BannerSkeleton = () => (
  <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
    <div className="w-full md:w-1/2 min-w-0 aspect-[5/2] bg-gray-200 rounded-lg animate-pulse" />
    <div className="w-full md:w-1/2 min-w-0 aspect-[5/2] bg-gray-200 rounded-lg animate-pulse" />
  </div>
);

export default function BannerSection({
  className = "",
  bannerIndex = 0,
}: BannerSectionProps) {
  const [banners, setBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    fetch(API_URL + "sectionbanner/getsectionbanner")
      .then((res) => res.json())
      .then((result) => setBanners(result.data || []))
      .catch((err) => console.error("Banner fetch error:", err));
  }, []);

  if (!banners.length) {
    return (
      <div className={`w-full max-w-[1440px] mx-auto px-6 ${className} py-6`}>
        <BannerSkeleton />
      </div>
    );
  }

  const banner = banners[bannerIndex] || banners[0];

  return (
    <div className={`w-full max-w-[1440px] mx-auto px-6 ${className} py-6`}>
      {/* Stacks on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
        {/* Left Banner */}
        <a
          href={banner.left.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-full md:w-1/2 min-w-0 aspect-[5/2] rounded-lg overflow-hidden flex items-center justify-center"
        >
          {banner.left.image ? (
            <img
              src={BASE_URL + "images/" + banner.left.image}
              alt={banner.left.name}
              className="w-full h-full object-cover object-center md:object-left"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
          )}
        </a>

        {/* Right Banner */}
        <a
          href={banner.right.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-full md:w-1/2 min-w-0 aspect-[5/2] rounded-lg overflow-hidden flex items-center justify-center"
        >
          {banner.right.image ? (
            <img
              src={BASE_URL + "images/" + banner.right.image}
              alt={banner.right.name}
              className="w-full h-full object-cover object-center md:object-right"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
          )}
        </a>
      </div>
    </div>
  );
}
