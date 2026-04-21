import { Link } from "react-router"
import { Order } from "../../Types/types"
import { formatDate } from "../UIComponents/Inputs"
import { TableBodyCell, TableHeader, TableWrapper } from "../UIComponents/Table"
import { AiOutlineEye } from "react-icons/ai"
import { isBulkOrder } from "@/lib/utils"

type UserOrderTableProps = {
  orders: Order[]
}
export default function UserOrderTable({ orders }: UserOrderTableProps) {
  const headers = [
    "Order ID",
    "Status",
    "Type",
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
            <td align="center">
              {isBulkOrder(or) ? (
                <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
                  Bulk Order
                </span>
              ) : (
                <span className="text-xs text-gray-500">Regular</span>
              )}
            </td>
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
