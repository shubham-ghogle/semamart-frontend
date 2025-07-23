import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../Screens/ProductDetailScreen/GetAllProduct.Hooks";
import ProductCard from "../Product/EquipmentProductCard"; // Update path if needed


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

  // Filter products by type
  const filteredProducts = products.filter(
  (product) => product.productType === productType && product._id !== productId
);


  // Shuffle the array
  const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());

  // Pick first 5
  const selectedProducts = shuffled.slice(0, 5);

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {selectedProducts.length > 0 ? (
        selectedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))
      ) : (
        <p className="text-gray-500 text-sm">No products found for "{productType}".</p>
      )}
    </div>
  );
}

 
