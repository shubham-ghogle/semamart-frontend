import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { Order } from "../../Types/types";
import { getOrdersForSeller, useCustomEnsureQuerty } from "./Seller.Hooks";
import SellerOrderTable from "../../components/Seller/SellerOrderTable";
import { useSellerSession } from "./sellerSession";


export default function SellerAllOrders() {
  const { shopId, canAccess } = useSellerSession();
  const { data: orders, status } = useCustomEnsureQuerty<Order[]>(["seller-orders", shopId],
    () => getOrdersForSeller(shopId || ""), shopId)
  const displayStatus = canAccess("AllOrders") ? status : "success";

  const errMess = "Something went wrong"


  return <SellerMainWrapper status={displayStatus} errorMessage={errMess} heading="Orders">
    {!canAccess("AllOrders") ? (
      <div className="rounded-xl border bg-white p-4 text-gray-600">You do not have access to view orders.</div>
    ) : orders && (
      <SellerOrderTable orders={orders} />
    )}
  </SellerMainWrapper>
}
