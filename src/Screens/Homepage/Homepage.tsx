import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../components/Homepage/Homepage.hooks";
import BestDeals from "../../components/Homepage/BestDeals";

export default function Homepage() {
  const { status: productFetchingStatus } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: Infinity,
  });

  return (
    <section>
      <figure
        className="min-h-[70vh] bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg)",
        }}
      ></figure>
      <div className="container mx-auto">
        <BestDeals status={productFetchingStatus} />
      </div>
    </section>
  );
}
