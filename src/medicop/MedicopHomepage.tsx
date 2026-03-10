import { useMemo } from "react";
import { Product } from "@/Types/types";
import ImageSliderHome from "@/components/Homepage/ImageSliderHome";
import PopularCategories from "@/components/Homepage/PopularCategories";
import BestSellerShowcase from "@/components/Homepage/BestSellerShowcase";
import BannerSection from "@/components/Homepage/BanerSection";
import { GiCrown } from "react-icons/gi";
import { FaShippingFast } from "react-icons/fa";
import { FaCapsules } from "react-icons/fa6";
import { MEDICOP_SHOWCASE_PRODUCTS } from "./data";

export default function MedicopHomepage() {
  const products = MEDICOP_SHOWCASE_PRODUCTS as unknown as Product[];

  const shuffledProducts = useMemo(() => {
    const copy = [...products];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [products]);

  return (
    <section className="w-full bg-gray-100">
      <ImageSliderHome />

      <div className="w-full px-6 pt-8 space-y-12 mx-auto">
        <div className="hidden md:block">
          <PopularCategories />
        </div>

        <BestSellerShowcase
          products={products}
          status="success"
          cardMode="medicop"
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
          products={products}
          status="success"
          cardMode="medicop"
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

        <BestSellerShowcase
          products={products}
          status="success"
          cardMode="medicop"
          title="Top Consumables"
          badgeText="High demand items"
          subText="Most ordered consumable products."
          icon={<FaCapsules className="text-white" size={18} />}
          bgFrom="#065f46"
          bgTo="#047857"
          iconBg="#10b981"
          accentBg="#34d399"
          textColor="#ffffff"
        />

        <BestSellerShowcase
          products={shuffledProducts}
          status="success"
          cardMode="medicop"
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

        <BestSellerShowcase
          products={products}
          status="success"
          cardMode="medicop"
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
          status="success"
          cardMode="medicop"
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
