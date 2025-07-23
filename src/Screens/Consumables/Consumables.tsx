import { useQuery } from "@tanstack/react-query";
import { getProducts } from "./Consumables.Hooks";
import ProductShowcase from "../../components/Homepage/ProductShowcase";
import ImageSlider from "../../components/Homepage/ImageSlider";

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
    <section>
      <ImageSlider image="banner_Consumables.png" />
      <div className="container max-w-[1060px] mx-auto px-4 pt-12">
        <ProductShowcase
          status={productFetchingStatus}
          title="Most Popular"
          products={products}
        />
        <ProductShowcase
          status={productFetchingStatus}
          title="Best Sellers"
          products={products}
        />
        <ProductShowcase
          status={productFetchingStatus}
          title="Recent Items"
          products={products}
        />
      </div>
    </section>
  );
}
