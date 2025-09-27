import { useQuery } from "@tanstack/react-query";
import { getProducts } from "./Consumables.Hooks";
import ProductShowcase from "../../components/Homepage/ProductShowcase";
import ImageSliderHome from "../../components/Homepage/ImageSliderHome";

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
    <section className="w-full">
      <ImageSliderHome />

      <div className="w-full px-6 pt-12 space-y-16">
        {/* Most Popular */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C170D] mb-4">
            Most Popular
          </h2>
          <div className="h-1.5 w-28 rounded-full bg-gradient-to-r from-[#1C647C] via-[#0D9488] to-[#14B8A6] mb-6"></div>
          <ProductShowcase
            status={productFetchingStatus}
            title=""
            products={products}
            // layout="grid"
          />
        </div>

        {/* Best Sellers */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C170D] mb-4">
            Best Sellers
          </h2>
          <div className="h-1.5 w-28 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#F97316] to-[#EF4444] mb-6"></div>
          <ProductShowcase
            status={productFetchingStatus}
            title=""
            products={products}
            // layout="collage"
          />
        </div>

        {/* Recent Items */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C170D] mb-4">
            Recent Items
          </h2>
          <div className="h-1.5 w-28 rounded-full bg-gradient-to-r from-[#22C55E] via-[#16A34A] to-[#15803D] mb-6"></div>
          <ProductShowcase
            status={productFetchingStatus}
            title=""
            products={products}
          />
        </div>
      </div>
    </section>
  );
}
