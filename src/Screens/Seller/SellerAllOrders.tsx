import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useSellerStore } from "../../store/sellerStore";
import { Order } from "../../Types/types";
import { TableBodyCell, TableHeader, TableWrapper } from "../../components/UI/Table";
import { AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router";
import { formatDate } from "../../components/UI/Inputs";
import { getOrdersForSeller, useCustomEnsureQuerty } from "./Seller.Hooks";

const headers = [
  "Order ID",
  "Status",
  "Customer",
  // "Order Quantity",
  "Total Price",
  "Ordered on",
  "Actions",
]

export default function SellerAllOrders() {
  const seller = useSellerStore(state => state.seller)
  const { data: orders, status } = useCustomEnsureQuerty<Order[]>(["seller-orders", seller?._id],
    () => getOrdersForSeller(seller?._id || ""), seller?._id)

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
              {/* <TableBodyCell text={or.cart.length.toString()} /> */}
              <TableBodyCell text={or.user.firstName + " " + or.user.lastName} />
              <TableBodyCell text={or.totalPrice.toString()} />
              <TableBodyCell text={formatDate(or.createdAt)} />
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
