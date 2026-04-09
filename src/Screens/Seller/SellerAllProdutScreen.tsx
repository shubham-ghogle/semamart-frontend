// src/pages/seller/SellerAllProductsScreen.tsx
import { useQuery } from "@tanstack/react-query";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { getProductsForSeller  } from "./Seller.Hooks";
import SellerProductTable from "@/components/Seller/SellerProductsTable";
import { useSellerSession } from "./sellerSession";

export default function SellerAllProductsScreen() {
  const { shopId, canAccess } = useSellerSession();
  const { data, status } = useQuery({
    queryKey: ["seller-products", shopId],
    queryFn: () => getProductsForSeller(shopId || ""),
    enabled: !!shopId,
  });
  const displayStatus = canAccess("AllProducts") ? status : "success";

  const errMess = "Something went wrong";

  return (
    <SellerMainWrapper
      status={displayStatus}
      errorMessage={errMess}
      heading="Products"
    >
      {!canAccess("AllProducts") ? (
        <div className="rounded-xl border bg-white p-4 text-gray-600">You do not have access to view products.</div>
      ) : data && (
        <div className="p-4">
          <SellerProductTable products={data} />
        </div>
      )}
      {status === "error" && <p>{errMess}</p>}
    </SellerMainWrapper>
  );
}
