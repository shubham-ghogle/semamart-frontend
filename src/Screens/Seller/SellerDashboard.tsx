// src/pages/seller/SellerDashboard.tsx  (or the path you use)
import { AiOutlineMoneyCollect } from "react-icons/ai";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useSellerStore } from "../../store/sellerStore";
import { DashboardCard } from "../../components/UIComponents/Dashboard";
import { AiOutlineProduct } from "react-icons/ai";
import { useQuery } from "@tanstack/react-query";
import { getOrdersForSeller, getProductsForSeller } from "./Seller.Hooks";
import { CiDeliveryTruck } from "react-icons/ci";
import SellerOrderTable from "../../components/Seller/SellerOrderTable";

type status = "pending" | "success" | "error";

export default function SellerDashboard() {
  const { seller } = useSellerStore((state) => state);

  const { data: orders, error: orderErr, status: orderStatus } = useQuery({
    queryKey: ["seller-orders", seller?._id],
    queryFn: () => getOrdersForSeller(seller?._id || ""),
    staleTime: Infinity,
    enabled: !!seller?._id,
  });

  const { data: products, status: proStatus, error: proError } = useQuery({
    queryKey: ["seller-products", seller?._id],
    queryFn: () => getProductsForSeller(seller?._id || ""),
    staleTime: Infinity,
    enabled: !!seller?._id,
  });

  const isSuccess = orderStatus === "success" && proStatus === "success";
  const isError = orderStatus === "error" || proStatus === "error";

  let overAllStatus: status = "pending";
  if (isSuccess) overAllStatus = "success";
  else if (isError) overAllStatus = "error";

  const overAllError =
    (proError?.message && orderErr?.message && `${proError.message}\n${orderErr.message}`) ||
    proError?.message ||
    orderErr?.message ||
    "Something went wrong";

  const variants = products?.flatMap((p) => p.variants) || [];

  return (
    <SellerMainWrapper status={overAllStatus} errorMeassage={overAllError} heading="Seller Dashboard">
      {isSuccess && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <DashboardCard
              heading="Available Balance"
              icon={<AiOutlineMoneyCollect size={20} />}
              value={seller?.availableBalance || 0}
              linkTo="#"
              linkLabel="Withdraw Money"
            />
            <DashboardCard
              heading="All Orders"
              icon={<CiDeliveryTruck size={20} />}
              value={orders?.length || 0}
              linkTo="orders"
              linkLabel="View Orders"
            />
            <DashboardCard
              heading="All Products"
              icon={<AiOutlineProduct size={20} />}
              value={variants?.length || 0}
              linkTo="products"
              linkLabel="View Products"
            />
          </section>

          <section className="mt-8">
            <h2 className="text-center text-2xl mb-4 text-gray-800 font-semibold">Recent Orders</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <SellerOrderTable orders={orders} />
            </div>
          </section>
        </>
      )}
    </SellerMainWrapper>
  );
}
