import { useQueryClient } from "@tanstack/react-query";
import { Product } from "../../Types/types";
import ProductCard from "../Product/ProductCard";

type BestDealsProps = {
  status: "error" | "success" | "pending";
  title: string;
};

export default function ProductShowcase({ status, title }: BestDealsProps) {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<Product[]>(["products"]);
  const allProductsData = data || [];
  const sortedData = allProductsData?.sort((a, b) => b.sold_out - a.sold_out);
  const firstFive = sortedData && sortedData.slice(0, 5);

  return (
    <article className="mx-12">
      <h2 className="text-2xl font-bold text-darkBlue">{title}</h2>
      {status === "pending" && (
        <div className="h-80 text-xl grid place-items-center">Loading...</div>
      )}
      {status === "success" && (
        <div className="mt-3 flex items-center gap-8 mb-12">
          {firstFive?.map((el) => <ProductCard product={el} key={el._id} />)}
        </div>
      )}
    </article>
  );
}
