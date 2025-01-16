import { useQuery } from "@tanstack/react-query";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";
import { getVerifiedSellers } from "./Admin.HooksAndUtils";
import {
  AdminTableBodyCell,
  AdminTableHeader,
} from "../../components/UI/Table";

const headers = [
  "Joined on",
  "Seller id",
  "Seller Name",
  "Business Name",
  "Email",
];
export default function AllSellerScreen() {
  const { data, error, status } = useQuery({
    queryKey: ["verifiedSellers"],
    queryFn: getVerifiedSellers,
    retry: 3,
  });

  return (
    <AdminMainWrapper
      heading="All Sellers"
      status={status}
      errorMeassage={error?.message}
    >
      {status === "success" && data && (
        <div className="p-6 bg-white max-w-6xl mx-auto rounded-xl drop-shadow-md">
          <table className="w-full table-auto rounded-table">
            <AdminTableHeader headers={headers} />
            <tbody>
              {data.sellers.map((el) => (
                <tr key={el._id}>
                  <AdminTableBodyCell
                    text={new Date(el.createdAt).toLocaleDateString("en-IN")}
                  />
                  <AdminTableBodyCell text={el._id} />
                  <AdminTableBodyCell text={el.firstName + " " + el.lastName} />
                  <AdminTableBodyCell text={el.businessName || "n/a"} />
                  <AdminTableBodyCell text={el.email} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminMainWrapper>
  );
}
