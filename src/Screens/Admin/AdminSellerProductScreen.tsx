import { useParams } from "react-router";
import { getProductsForSeller } from "../Seller/Seller.Hooks";
import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";
import AdminAllProductTable from "@/components/Admin/AdminAllProductTable";
import { useQuery } from "@tanstack/react-query";

export default function AdminSellerProductScreen() {
  const { sellerId } = useParams();
  const { data, status } = useQuery({
    queryKey: ["seller-products", sellerId],
    queryFn: () => getProductsForSeller(sellerId || ""),
    enabled: !!sellerId,
  });

  return (
    <AdminMainWrapper
      status={status}
      heading="Products"
      errorMeassage="Something went wrong"
    >
      {status === "success" && data && <AdminAllProductTable products={data} />}
    </AdminMainWrapper>
  );
}
