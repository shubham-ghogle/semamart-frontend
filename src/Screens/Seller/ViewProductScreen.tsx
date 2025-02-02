import { useQuery } from "@tanstack/react-query";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useParams } from "react-router";
import { getProductDetail } from "../ProductDetailScreen/ProductDetails.HooksUtils";
import ProductDetailsForm from "../../components/Seller/ProductDetailsForm";

export default function ViewProductScreen() {
  const { id } = useParams();

  const { data: product, status, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id),
  });


  return (
    <SellerMainWrapper status={status} errorMeassage={error?.message} heading="Product Detail">
      {status === "success" && product && (
        <ProductDetailsForm mode="views" product={product} media={product.images} />
      )}
    </SellerMainWrapper>
  )
}
