import { useQuery } from "@tanstack/react-query";
import { getProducts } from "./Equipment.Hooks";
import ProductShowcase from "../../components/Homepage/ProductShowcase";
import ImageSlider from "../../components/Homepage/ImageSlider";

export default function Equipment() {
  const { status: productFetchingStatus } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: Infinity,
  });

  return (
    <section>
      <ImageSlider image="banner_Equipment.png"/>
      <div className="container max-w-[1060px] mx-auto px-4 pt-12">
        <ProductShowcase status={productFetchingStatus} title="Most Popular" />
        <ProductShowcase status={productFetchingStatus} title="Best Sellers" />
        <ProductShowcase status={productFetchingStatus} title="Recent Items" />
      </div>
    </section>
  );
}
