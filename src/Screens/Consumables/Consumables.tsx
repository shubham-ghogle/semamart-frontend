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
    <div className="w-full px-6 pt-12">
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
      {/* <ProductShowcase
        status={productFetchingStatus}
        title="Recent Items"
        products={products}
      /> */}
    </div>
  </section>
);
}
