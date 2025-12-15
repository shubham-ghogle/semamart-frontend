import { useQuery } from "@tanstack/react-query";
import { getProducts } from "./Consumables.Hooks";
import ImageSliderHome from "../../components/Homepage/ImageSliderHome";
import PopularCategories from "../../components/Homepage/PopularCategories";
import BestSellerShowcase from "../../components/Homepage/BestSellerShowcase";
import { GiCrown } from "react-icons/gi";
import { FaShippingFast } from "react-icons/fa";
import BannerSection from "@/components/Homepage/BanerSection";
import { useMemo } from "react";

export default function Consumables() {
  const {
    data: products = [],
    status: productFetchingStatus,
  } = useQuery({
    queryKey: ["products", "consumables"],
    queryFn: getProducts,
    staleTime: Infinity,
  });

  // 🔁 Randomized copy ONLY for Top Equipment
  const shuffledProducts = useMemo(() => {
    const copy = [...products];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [products]);

  return (
    <section className="w-full bg-gray-100">
      <ImageSliderHome />

      <div className="w-full px-6 pt-8 space-y-12 mx-auto">
        {/* Popular categories */}
        <div className="hidden md:block">
          <PopularCategories />
        </div>

        {/* ===== SECTION 1 ===== */}
        <BestSellerShowcase
          products={products}
          status={productFetchingStatus}
          title="Best Seller"
          badgeText="Guaranteed discounts"
          subText="Shop from our top-selling items."
          icon={<GiCrown className="text-[#3B0B68]" size={18} />}
          bgFrom="#2a0450"
          bgTo="#39104f"
          iconBg="#fbbf24"
          accentBg="#ec4899"
          textColor="#fff"
        />

        <BestSellerShowcase
          products={shuffledProducts}
          status={productFetchingStatus}
          title="Top Equipment"
          badgeText="Limited stock"
          subText="Picked by pros."
          icon={<FaShippingFast size={18} />}
          bgFrom="#0ea5e9"
          bgTo="#0369a1"
          iconBg="#ffffff"
          accentBg="#06b6d4"
          textColor="#04263a"
          maxItems={8}
        />

        <BannerSection bannerIndex={0} />

        {/* ===== SECTION 2 ===== */}
        <BestSellerShowcase
          products={products}
          status={productFetchingStatus}
          title="Best Seller"
          badgeText="Guaranteed discounts"
          subText="Shop from our top-selling items."
          icon={<GiCrown className="text-[#3B0B68]" size={18} />}
          bgFrom="#2a0450"
          bgTo="#39104f"
          iconBg="#fbbf24"
          accentBg="#ec4899"
          textColor="#fff"
        />

        <BestSellerShowcase
          products={shuffledProducts}
          status={productFetchingStatus}
          title="Top Equipment"
          badgeText="Limited stock"
          subText="Picked by pros."
          icon={<FaShippingFast size={18} />}
          bgFrom="#0ea5e9"
          bgTo="#0369a1"
          iconBg="#ffffff"
          accentBg="#06b6d4"
          textColor="#04263a"
          maxItems={8}
        />

        <BannerSection bannerIndex={1} />

        {/* ===== SECTION 3 ===== */}
        <BestSellerShowcase
          products={products}
          status={productFetchingStatus}
          title="Best Seller"
          badgeText="Guaranteed discounts"
          subText="Shop from our top-selling items."
          icon={<GiCrown className="text-[#3B0B68]" size={18} />}
          bgFrom="#2a0450"
          bgTo="#39104f"
          iconBg="#fbbf24"
          accentBg="#ec4899"
          textColor="#fff"
        />

        <BestSellerShowcase
          products={shuffledProducts}
          status={productFetchingStatus}
          title="Top Equipment"
          badgeText="Limited stock"
          subText="Picked by pros."
          icon={<FaShippingFast size={18} />}
          bgFrom="#0ea5e9"
          bgTo="#0369a1"
          iconBg="#ffffff"
          accentBg="#06b6d4"
          textColor="#04263a"
          maxItems={8}
        />

        <BannerSection bannerIndex={2} />
      </div>
    </section>
  );
}
