import { useQueryClient } from "@tanstack/react-query";
import { Product } from "../../Types/types";
import ProductCard from "../Product/ProductCard";

type BestDealsProps = {
  status: "error" | "success" | "pending";
};

export default function BestDeals({ status }: BestDealsProps) {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<{
    success: string;
    products: Product[];
  }>(["products"]);

  const allProductsData = data?.products || [];
  const sortedData = allProductsData?.sort((a, b) => b.sold_out - a.sold_out);
  const firstFive = sortedData && sortedData.slice(0, 5);

  return (
    <article className="mt-8">
      <h2 className="text-3xl font-semibold text-slate-900">Best Deals</h2>
      {status === "pending" && (
        <div className="h-80 text-xl grid place-items-center">Loading...</div>
      )}
      {status === "success" && (
        <div className="mt-3 grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 border-0">
          {firstFive?.map((el) => <ProductCard product={el} key={el._id} />)}
        </div>
      )}
    </article>
  );
}
