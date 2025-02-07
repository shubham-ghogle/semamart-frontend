import { Link } from "react-router"
import { Order } from "../../Types/types"
import { formatDate } from "../UI/Inputs"
import { TableBodyCell, TableHeader, TableWrapper } from "../UI/Table"
import { AiOutlineEye } from "react-icons/ai"

type UserOrderTableProps = {
  orders: Order[]
}
export default function UserOrderTable({ orders }: UserOrderTableProps) {
  const headers = [
    "Order ID",
    "Status",
    "Customer",
    // "Order Quantity",
    "Total Price",
    "Ordered on",
    "Actions",
  ]
  return (
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
  )
}
