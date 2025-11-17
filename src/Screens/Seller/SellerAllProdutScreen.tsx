// src/pages/seller/SellerAllProductsScreen.tsx
import { useQuery } from "@tanstack/react-query";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useSellerStore } from "../../store/sellerStore";
import { getProductsForSeller  } from "./Seller.Hooks";
import SellerProductTable from "@/components/Seller/SellerProductsTable";

export default function SellerAllProductsScreen() {
  const { seller } = useSellerStore((state) => state);
  const { data, status } = useQuery({
    queryKey: ["seller-products", seller?._id],
    queryFn: () => getProductsForSeller(seller?._id),
  });

  const errMess = "Something went wrong";

  return (
    <SellerMainWrapper
      status={status}
      errorMeassage={errMess}
      heading="Products"
    >
      {data && (
        <div className="p-4">
          <SellerProductTable products={data} />
        </div>
      )}
      {status === "error" && <p>{errMess}</p>}
    </SellerMainWrapper>
  );
}
