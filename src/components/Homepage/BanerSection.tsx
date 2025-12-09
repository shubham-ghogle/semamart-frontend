import { useEffect, useState } from "react";

// Define a type for each side of the banner
type BannerSide = {
  name: string;
  image: string;
  link: string;
};

// Define the full banner type
type BannerItem = {
  title?: string;
  left: BannerSide;
  right: BannerSide;
};

// Props for BannerSection
type BannerSectionProps = {
  className?: string;
  bannerIndex?: number; // Which banner to display, default 0
};

// Helper to normalize image URLs
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
const BannerSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
    <div className="h-[370px] bg-gray-200 rounded-lg animate-pulse" />
    <div className="h-[370px] bg-gray-200 rounded-lg animate-pulse" />
  </div>
);

export default function BannerSection({ className = "", bannerIndex = 0 }: BannerSectionProps) {
  const [banners, setBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    fetch("/api/v2/sectionbanner/getallsectionbanner")
      .then((res) => res.json())
      .then((result) => setBanners(result.data || []))
      .catch((err) => console.error("Banner fetch error:", err));
  }, []);

  // Show animated skeleton while loading
  if (!banners.length) {
    return (
      <div className={`w-full max-w-[1440px] mx-auto px-6 ${className} py-6`}>
        <BannerSkeleton />
      </div>
    );
  }

  // Use the bannerIndex prop; fallback to first banner if out of bounds
  const banner = banners[bannerIndex] || banners[0];

  return (
    <div className={`w-full max-w-[1440px] mx-auto px-6 ${className} py-6`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Banner */}
        <a
          href={banner.left.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative rounded-lg overflow-hidden h-[370px] flex items-center justify-center"
        >
          {banner.left.image ? (
            <img
              src={normalizeImage(banner.left.image)}
              alt={banner.left.name}
              className="w-full h-full object-cover object-left"
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
          className="relative rounded-lg overflow-hidden h-[370px] flex items-center justify-center"
        >
          {banner.right.image ? (
            <img
              src={normalizeImage(banner.right.image)}
              alt={banner.right.name}
              className="w-full h-full object-cover object-right"
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
