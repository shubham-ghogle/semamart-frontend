// RelatedProducts.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../Screens/ProductDetailScreen/GetAllProduct.Hooks";
import ProductCard from "../Homepage/ProductCard";

type RelatedProductsProps = {
  productType: string;
  productId: string;
};

export default function RelatedProducts({ productType, productId }: RelatedProductsProps) {
  const { data: products = [], status, error } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: Infinity,
  });

  if (status === "pending") return <div>Loading...</div>;
  if (status === "error") return <div>Error: {(error as Error).message}</div>;

  const filteredProducts = products.filter(
    (product: any) => product.productType === productType && product._id !== productId
  );
  const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
  const selectedProducts = shuffled.slice(0, 6);

  // adjust this to make mobile cards wider/narrower
  const MOBILE_CARD_WIDTH = 190; // px — try 160, 170, 180 depending on how wide you want them

  return (
    <div className="w-full mt-4">
      {selectedProducts.length > 0 ? (
        <>
          {/* MOBILE: horizontal scroller with a small "peek" so user knows there's more */}
          <div className="md:hidden -mx-4 px-4 overflow-x-auto">
            <div
              className="flex gap-3 snap-x snap-mandatory"
              style={{ paddingBottom: 6 }} /* small bottom padding for visual breathing room */
            >
              {selectedProducts.map((product: any, idx: number) => (
                <div
                  key={product._id}
                  className="flex-shrink-0 snap-start"
                  style={{
                    width: MOBILE_CARD_WIDTH,
                    // Add a tiny right margin for a peek effect (last item no extra)
                    marginRight: idx === selectedProducts.length - 1 ? 0 : 6,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* TABLET & DESKTOP: grid (unchanged) */}
          <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-3">
            {selectedProducts.map((product: any) => (
              <div key={product._id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm">No products found for "{productType}".</p>
      )}
    </div>
  );
}
