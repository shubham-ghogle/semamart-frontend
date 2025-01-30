import { useQueryClient } from "@tanstack/react-query";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useSellerStore } from "../../store/sellerStore";
import { Order } from "../../Types/types";
import { TableBodyCell, TableHeader, TableWrapper } from "../../components/UI/Table";
import { AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router";
import { formatDate } from "../../components/UI/Inputs";
import { getOrdersForSeller } from "./Seller.Hooks";
import { useEffect, useState } from "react";

const headers = [
  "Order ID",
  "Status",
  "Order Quantity",
  "Total Price",
  "Ordered on",
  "Delivered on",
  "",
]

export default function SellerAllOrders() {
  const seller = useSellerStore(state => state.seller)
  const qC = useQueryClient()
  // const orders = qC.getQueryData(["seller-orders", seller?._id]) as (Order[] | undefined)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [status, setStatus] = useState<"success" | "error" | "pending">("pending")

  useEffect(() => {
    async function z() {
      const a = await qC.ensureQueryData({ queryKey: ["seller-orders", seller?._id], queryFn: () => getOrdersForSeller(seller?._id || "") })
      if (!a) {
        setStatus("error")
        return
      }
      setOrders(a)
      setStatus("success")
    }
    setStatus("pending")
    z()
  }, [seller])

  // const status = orders ? "success" : "error"
  const errMess = "Something went wrong"


  return <SellerMainWrapper status={status} errorMeassage={errMess} heading="Orders">
    {orders && (
      <TableWrapper>
        <TableHeader headers={headers} />
        <tbody>
          {orders.map(or => (
            <tr key={or._id}>
              <TableBodyCell text={or._id} />
              <TableBodyCell text={or.status || ""} />
              <TableBodyCell text={or.cart.length.toString()} />
              <TableBodyCell text={or.totalPrice.toString()} />
              <TableBodyCell text={formatDate(or.createdAt)} />
              <TableBodyCell text={formatDate(or.deliveredAt)} />
              <td align="center">
                <button>
                  <Link to={or._id}>
                    <AiOutlineEye size={20} />
                  </Link>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    )}
  </SellerMainWrapper>
}
