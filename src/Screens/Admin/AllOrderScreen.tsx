import { useQuery } from "@tanstack/react-query";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";
import { getAllOrders } from "./Admin.HooksAndUtils";
import { TableBodyCell, TableHeader } from "../../components/UI/Table";

const headers = [
  "Created on",
  "Order id",
  "Shop Name",
  "Shipping Address",
  "Status",
];
export default function AllOrderScreen() {
  const { data, error, status } = useQuery({
    queryKey: ["verifiedOrders"],
    queryFn: getAllOrders,
    retry: 3,
  });
  console.log("data", data);

  return (
    <AdminMainWrapper
      heading="All Orders"
      status={status}
      errorMeassage={error?.message}
    >
      {status === "success" && data && (
        <div className="p-6 bg-white max-w-6xl mx-auto rounded-xl drop-shadow-md">
          <table className="w-full table-auto rounded-table">
            <TableHeader headers={headers} />
            <tbody>
              {data.orders.map((el) => (
                <tr key={el._id}>
                  <TableBodyCell
                  text={el.createdAt ? new Date(el.createdAt).toLocaleDateString("en-IN") : 'N/A'}
                />
                  <TableBodyCell text={el._id} />
                  <TableBodyCell text={el.shop || 'N/A'}   />      
                            <TableBodyCell text={el.shippingAddress.district || "n/a"} />
                  <TableBodyCell text={el.status || 'N/A'} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminMainWrapper>
  );
}
