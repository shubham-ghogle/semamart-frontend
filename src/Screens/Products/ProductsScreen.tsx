import { useQuery } from "@tanstack/react-query";
import ProductCard from "../../components/Product/ProductCard";
import { getProducts } from "../Homepage/Homepage.Hooks";
import LoaderUi from "../../components/UI/LoaderUi";

export default function ProductsScreen() {
  const { status, data: products } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: Infinity,
  });

  return (
    <section className="container mx-auto mt-14 flex gap-5 px-4">
      <article className="h-full bg-red-400 w-72">filters</article>
      {status === "pending" && <LoaderUi title="loading..." />}
      {status === "success" && products && (
        <ul className="w-full flex flex-wrap gap-12 h-full ">
          {products?.map((pro) => (
            <li key={pro._id} className="">
              <ProductCard product={pro} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
