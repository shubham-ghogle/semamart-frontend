import { Link } from "react-router"
import { Order } from "../../Types/types"
import { formatDate } from "../UIComponents/Inputs"
import { TableBodyCell, TableHeader, TableWrapper } from "../UIComponents/Table"
import { AiOutlineEye } from "react-icons/ai"

type UserOrderTableProps = {
  orders: Order[]
}
export default function UserOrderTable({ orders }: UserOrderTableProps) {
  const headers = [
    "Order ID",
    "Status",
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
            <TableBodyCell
                text={or.totalPrice.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
            />
            <TableBodyCell text={formatDate(or.createdAt)} />
            <td align="center">
              <button>
                {/* TODO order details */}
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
