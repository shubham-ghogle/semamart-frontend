import { useQuery } from "@tanstack/react-query";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { getSellerOrderRequests } from "./Seller.Hooks";
import OrderRequestTable from "@/components/Order/OrderRequestTable";
import { useSellerSession } from "./sellerSession";

export default function SellerOrderRequests() {
  const { canAccess } = useSellerSession();
  const { data, status, error } = useQuery({
    queryKey: ["seller-order-requests"],
    queryFn: getSellerOrderRequests,
    enabled: canAccess("Requests"),
  });

  const displayStatus = canAccess("Requests") ? status : "success";

  return (
    <SellerMainWrapper heading="Order Requests" status={displayStatus} errorMessage={error?.message}>
      {!canAccess("Requests") ? (
        <div className="rounded-xl border bg-white p-4 text-gray-600">
          You do not have access to manage order requests.
        </div>
      ) : (
        status === "success" && (
          <OrderRequestTable
            orders={data || []}
            basePath="/seller/orders"
            customerLabel="Institute"
          />
        )
      )}
    </SellerMainWrapper>
  );
}
