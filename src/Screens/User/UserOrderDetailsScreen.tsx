import { useParams } from "react-router";
import UserScreenMainWrapper from "../../components/User/UserScreenMainWrapper";
import { useQuery } from "@tanstack/react-query";
import { getUserOrderDetails } from "./User.HooksUtils";
import UserOrderDetails from "../../components/User/UserOrderDetails";

export default function UserOrderDetailsScreen() {
  const { orderId } = useParams()

  const { data: order, status: orderStatus, error } = useQuery({
    queryKey: ["user-order-detail", { orderId }],
    queryFn: () => getUserOrderDetails(orderId),
    enabled: !!orderId
  })

  return (
    <UserScreenMainWrapper heading="Order Details" status={orderStatus} errorMeassage={error?.message}>
      {orderStatus === "success" && order && (
        <UserOrderDetails data={order} />
      )}
    </UserScreenMainWrapper>
  )
}
