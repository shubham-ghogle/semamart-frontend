import { useQuery } from "@tanstack/react-query";
import { getProducts } from "./Consumables.Hooks";
import ImageSliderHome from "../../components/Homepage/ImageSliderHome";
import PopularCategories from "../../components/Homepage/PopularCategories";
import BestSellerShowcase from "../../components/Homepage/BestSellerShowcase";
import PromoBanners from "@/components/Homepage/PromoBanner";
import { GiCrown } from "react-icons/gi"; // optional
import { FaShippingFast } from "react-icons/fa"; 

export default function Consumables() {
  const {
    data: products = [],
    status: productFetchingStatus,
  } = useQuery({
    queryKey: ["products", "consumables"],
    queryFn: getProducts,
    staleTime: Infinity,
  });

  return (
    <section className="w-full bg-gray-100">
      <ImageSliderHome />

      <div className="w-full px-6 pt-8 space-y-12 mx-auto">
        {/* Popular categories */}
        <PopularCategories />
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
  products={products}
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
       <PromoBanners
        leftSrc="/banner_Consumables.png"
        rightSrc="/banner_Equipment.png"
       />
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
  products={products}
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
       <PromoBanners
        leftSrc="/banner_Consumables.png"
        rightSrc="/banner_Equipment.png"
       />
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
  products={products}
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
       <PromoBanners
        leftSrc="/banner_Consumables.png"
        rightSrc="/banner_Equipment.png"
       />
       

        {/* Most Popular (regular product showcase row) */}
        {/* <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C170D] mb-4">Most Popular</h2>
          <div className="h-1.5 w-28 rounded-full bg-gradient-to-r from-[#1C647C] via-[#0D9488] to-[#14B8A6] mb-6"></div>
          <ProductShowcase status={productFetchingStatus} title="" products={products} layout="row" />
        </div> */}

        {/* Recent Items */}
        {/* <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C170D] mb-4">Recent Items</h2>
          <div className="h-1.5 w-28 rounded-full bg-gradient-to-r from-[#22C55E] via-[#16A34A] to-[#15803D] mb-6"></div>
          <ProductShowcase status={productFetchingStatus} title="" products={products} />
        </div> */}
      </div>
    </section>
  );
}
