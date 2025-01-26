import { AiOutlineMoneyCollect } from "react-icons/ai";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useSellerStore } from "../../store/sellerStore";
import { DashboardCard } from "../../components/UI/Dashboard";
import { AiOutlineProduct } from "react-icons/ai";
import { FaBorderAll } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { getOrdersForSeller, getProductsForSeller } from "./Seller.Hooks";

type status =
  "pending" | "success" | "error"


export default function SellerDashboard() {
  const { seller } = useSellerStore((state) => state);

  const { data: orders, error: orderErr, status: orderStatus } = useQuery({
    queryKey: ["seller-orders", seller?._id],
    queryFn: () => getOrdersForSeller(seller?._id || ""),
    enabled: !!seller?._id
  });

  const { data: products, status: proStatus, error: proError } = useQuery({
    queryKey: ["seller-products", seller?._id],
    queryFn: () => getProductsForSeller(seller?._id || ""),
    enabled: !!seller?._id
  })

  const isSuccess = orderStatus === "success" && proStatus === "success";
  const isError = orderStatus === "error" || proStatus === "error";

  let overAllStatus: status = "pending"
  if (isSuccess) { overAllStatus = "success" } else if (isError) { overAllStatus = "error" }

  const overAllError = proError?.message && orderErr?.message ? proError?.message + "\n" + orderErr && orderErr?.message : "Something went wrong"


  return (
    <SellerMainWrapper status={overAllStatus} errorMeassage={overAllError} heading="Seller Dashboard">
      {isSuccess &&
        <section className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          <DashboardCard
            heading="Available Balance"
            icon={<AiOutlineMoneyCollect size={30} />}
            value={seller?.availableBalance || 0}
            linkTo="withdraw"
            linkLabel="Withdraw Money"
          />
          <DashboardCard
            heading="All Orders"
            icon={<FaBorderAll size={25} />}
            value={orders?.length || 0}
            linkTo="orders"
            linkLabel="View Orders"
          />
          <DashboardCard
            heading="All Products"
            icon={<AiOutlineProduct size={30} />}
            value={products?.length || 0}
            linkTo="products"
            linkLabel="View Products"
          />
        </section>
      }
    </SellerMainWrapper>
  );
}
