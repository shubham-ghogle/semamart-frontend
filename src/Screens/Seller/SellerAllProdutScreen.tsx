// src/pages/seller/SellerAllProductsScreen.tsx
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useSellerStore } from "../../store/sellerStore";
import { Product } from "../../Types/types";
import { getProductsForSeller, useCustomEnsureQuerty } from "./Seller.Hooks";
import SellerProductTable from "@/components/Seller/SellerProductsTable";

export default function SellerAllProductsScreen() {
  const { seller } = useSellerStore((state) => state);
  const { data, status } = useCustomEnsureQuerty<Product[]>(
    ["seller-products", seller?._id],
    () => getProductsForSeller(seller?._id),
    seller?._id,
  );

  const errMess = "Something went wrong";

  return (
    <SellerMainWrapper status={status} errorMeassage={errMess} heading="Products">
      {data && (
        <div className="p-4 bg-white shadow rounded">
          <SellerProductTable products={data} />
        </div>
      )}
      {status === "error" && <p>{errMess}</p>}
    </SellerMainWrapper>
  );
}
