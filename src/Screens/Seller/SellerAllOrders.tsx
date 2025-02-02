import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useSellerStore } from "../../store/sellerStore";
import { Order } from "../../Types/types";
import { getOrdersForSeller, useCustomEnsureQuerty } from "./Seller.Hooks";
import SellerOrderTable from "../../components/Seller/SellerOrderTable";


export default function SellerAllOrders() {
  const seller = useSellerStore(state => state.seller)
  const { data: orders, status } = useCustomEnsureQuerty<Order[]>(["seller-orders", seller?._id],
    () => getOrdersForSeller(seller?._id || ""), seller?._id)

  const errMess = "Something went wrong"


  return <SellerMainWrapper status={status} errorMeassage={errMess} heading="Orders">
    {orders && (
      <SellerOrderTable orders={orders} />
    )}
  </SellerMainWrapper>
}
