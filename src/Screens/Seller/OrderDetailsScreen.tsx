import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { getOrderDetails } from "./Seller.Hooks";
import SellerOrderDetail from "../../components/Seller/SellerOrderDetails";

export default function OrderDetailsScreen() {
  const { orderId } = useParams()


  const { data, status: orderStatus, error } = useQuery({
    queryKey: ["seller-order-detail", { orderId }],
    queryFn: () => getOrderDetails(orderId),
    enabled: !!orderId
  })


  return (
    <SellerMainWrapper status={orderStatus} heading="Order Details" errorMeassage={error?.message}>
      {orderStatus === "success" && data && (
        <SellerOrderDetail data={data} />
      )}
    </SellerMainWrapper >
  )
}
