import { useQuery } from "@tanstack/react-query";
import { getProducts } from "./Homepage.Hooks";
import ProductShowcase from "../../components/Homepage/ProductShowcase";
import ImageSlider from "../../components/Homepage/ImageSlider";

export default function Homepage() {
  const { status: productFetchingStatus } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: Infinity,
  });

  return (
    <section>
      <ImageSlider/>
      <div className="container mx-auto px-4 pt-12">
        <ProductShowcase status={productFetchingStatus} title="Most Popular" />
        <ProductShowcase status={productFetchingStatus} title="Best Seller" />
        <ProductShowcase status={productFetchingStatus} title="Recent Items" />
      </div>
    </section>
  );
}
