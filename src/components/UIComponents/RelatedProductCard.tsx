import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../Screens/ProductDetailScreen/GetAllProduct.Hooks";
import ProductCard from "../Homepage/ProductCard";
import { useMemo } from "react";
// import { get } from "http";

type RelatedProductsProps = {
  productType: string;
  productId: string;
};

export default function RelatedProductCard({ productType, productId }: RelatedProductsProps) {
  // ✅ Hook always runs
  const { data: products = [], status, error } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: Infinity,
  });


  // ✅ Hook always runs
  const selectedProducts = useMemo(() => {
    if (!products || !productType) return [];
    const filtered = products.filter(
      (p: any) => p.productType === productType && p._id !== productId
    );
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [products, productType, productId]);

  const MOBILE_CARD_WIDTH = 190;

  // ✅ Conditional rendering after hooks
  if (status === "pending") return <div>Loading...</div>;
  if (status === "error") return <div>Error: {(error as Error).message}</div>;

  if (selectedProducts.length === 0)
    return <p className="text-gray-500 text-sm">No products found for "{productType}".</p>;

  return (
    <div className="w-full mt-4">
      <div className="md:hidden -mx-4 px-4 overflow-x-auto">
        <div className="flex flex-row gap-3 snap-x snap-mandatory justify-start" style={{ paddingBottom: 6 }}>
          {selectedProducts.map((product: any, idx: number) => (
            <div
              key={product._id}
              className="flex-shrink-0 snap-start flex flex-row"
              style={{
                width: MOBILE_CARD_WIDTH,
                marginRight: idx === selectedProducts.length - 1 ? 0 : 6,
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mt-3">
        {selectedProducts.map((product: any) => (
          <div key={product._id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
