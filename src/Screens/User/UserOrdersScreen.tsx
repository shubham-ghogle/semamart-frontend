import { useQuery } from "@tanstack/react-query";
import UserScreenMainWrapper from "../../components/User/UserScreenMainWrapper";
import { useUserStore } from "../../store/userStore";
import { Order } from "../../Types/types";
import UserOrderTable from "../../components/User/UserOrderTable";

export default function UserOrdersScreen() {
  const user = useUserStore(st => st.user)

  const { data: orders, status } = useQuery({
    queryKey: ["user-orders", { userId: user?._id }],
    queryFn: async function () {
      const res = await fetch("/api/v2/order/get-all-orders/" + user?._id)
      if (!res.ok) throw new Error("Somethig went wrong")

      const data = await res.json() as { success: boolean, orders: Order[], message: string }
      if (!data.success) throw new Error(data.message)
      return data.orders
    },
    enabled: !!user
  })

  return <UserScreenMainWrapper heading="Orders" status={status}>
    {orders && <UserOrderTable orders={orders} />}
  </UserScreenMainWrapper>
}
