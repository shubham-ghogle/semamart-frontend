import { useQuery } from "@tanstack/react-query";
import { getBestSellers, getCategories, getProducts } from "../Screens/Consumables/Consumables.Hooks";
import ImageSliderHome from "../components/Homepage/ImageSliderHome";
import PopularCategories from "../components/Homepage/PopularCategories";
import BestSellerShowcase from "../components/Homepage/BestSellerShowcase";
import { GiCrown } from "react-icons/gi";
import { FaShippingFast } from "react-icons/fa";
import BannerSection from "@/components/Homepage/BanerSection";
import { useMemo } from "react";
import { FaCapsules } from "react-icons/fa6";

export default function MediqopHomepage() {
  // 🔥 Reusable helper function (inside this file)
  const getCategoryIdByName = (
    categories: any[],
    name: string
  ): string | undefined => {
    if (!categories || !name) return undefined;

    const normalizedTarget = name.trim().toLowerCase();

    const found = categories.find(
      (c) =>
        typeof c.name === "string" &&
        c.name.trim().toLowerCase() === normalizedTarget
    );

    return found?._id;
  };

  const {
    data: products = [],
    status: productFetchingStatus,
  } = useQuery({
    queryKey: ["products", "consumables"],
    queryFn: getProducts,
    staleTime: Infinity,
  });

  // fetch categories once
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 60 * 60 * 1000,
  });

  // ✅ Use helper function
  const medicalCategoryId = useMemo(
    () => getCategoryIdByName(categories, "Medical Equipment"),
    [categories]
  );

  // global best sellers
  const {
    data: bestSellers = [],
    status: bestSellerStatus,
  } = useQuery({
    queryKey: ["best-sellers", "global"],
    queryFn: () => getBestSellers({ limit: 10 }),
    staleTime: 5 * 60 * 1000,
  });

  // Top Equipment = Medical Equipment category best sellers
  const {
    data: TopEquipments = [],
    status: TopEquipmentsStatus,
  } = useQuery({
    queryKey: ["best-sellers", "medical-equipment", medicalCategoryId],
    queryFn: () =>
      getBestSellers({
        limit: 10,
        category: medicalCategoryId,
      }),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(medicalCategoryId),
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

  const consumablesCategoryId = useMemo(
  () => getCategoryIdByName(categories, "Consumables"),
  [categories]
);

 const {
  data: TopConsumables = [],
  status: TopConsumablesStatus,
} = useQuery({
  queryKey: ["best-sellers", "consumables", consumablesCategoryId],
  queryFn: () =>
    getBestSellers({
      limit: 10,
      category: consumablesCategoryId,
    }),
  staleTime: 5 * 60 * 1000,
  enabled: Boolean(consumablesCategoryId),
});


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
          products={bestSellers}
          status={bestSellerStatus}
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
          products={TopEquipments}
          status={TopEquipmentsStatus}
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
          cardVariant="mediqop"
        />

        <BannerSection bannerIndex={0} />

        {/* ===== SECTION 2 ===== */}
<BestSellerShowcase
  products={TopConsumables}
  status={TopConsumablesStatus}
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
