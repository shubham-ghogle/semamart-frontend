import { useQuery } from "@tanstack/react-query";
import UserScreenMainWrapper from "../../components/User/UserScreenMainWrapper";
import { useUserStore } from "../../store/userStore";
import { Order } from "../../Types/types";
import UserOrderTable from "../../components/User/UserOrderTable";
import { API_URL } from "@/data";
import { getAccountOwnerId } from "@/lib/utils";

export default function UserOrdersScreen() {
  const user = useUserStore(st => st.user)
  const accountOwnerId = getAccountOwnerId(user);

  const { data: orders, status } = useQuery({
    queryKey: ["user-orders", { userId: accountOwnerId }],
    queryFn: async function () {
      const res = await fetch(API_URL+"order/get-all-orders/" + accountOwnerId, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Somethig went wrong")

      const data = await res.json() as { success: boolean, orders: Order[], message: string }
      if (!data.success) throw new Error(data.message)
      return data.orders
    },
    enabled: !!accountOwnerId
  })

  return <UserScreenMainWrapper heading="Orders" status={status}>
    {status === "success" && orders && <UserOrderTable orders={orders} />}
  </UserScreenMainWrapper>
}
