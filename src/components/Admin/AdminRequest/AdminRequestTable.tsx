import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Seller } from "../../../Types/types";
import { AdminTableHeader } from "../../UI/Table";

const headers = ["Seller Name", "Business Name", "Email", "Actions"];
type AdminRequestTableParams = {
  sellers: Seller[];
};
export default function AdminRequestTable({
  sellers,
}: AdminRequestTableParams) {
  const qClient = useQueryClient();

  const { mutateAsync, variables: sellerId } = useMutation({
    mutationFn: async function (sellerId: string) {
      try {
        const response = await fetch("/api/v2/shop/verify-seller", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sellerId: sellerId }),
        });

        if (!response.ok) throw new Error();
        const data = await response.json();
        return data;
      } catch (err) {
        console.log(err);
      }
    },
    onSuccess: () => {
      qClient.invalidateQueries({
        queryKey: ["sellerRequests"],
      });
      qClient.invalidateQueries({
        queryKey: ["verifiedRequests"],
      });
    },
  });

  async function clickHandler(id: string) {
    try {
      await mutateAsync(id);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="p-6 bg-white max-w-4xl mx-auto rounded-xl drop-shadow-md">
      <table className="w-full table-auto rounded-table">
        <AdminTableHeader headers={headers} />
        <tbody>
          {sellers.map((el) => (
            <tr key={el._id}>
              <td className="p-4 text-slate-800">
                {el.firstName + " " + el.lastName}
              </td>
              <td className="p-4 text-slate-800">{el.businessName || "n/a"}</td>
              <td className="p-4 text-slate-800">{el.email}</td>
              <td className="p-4  text-slate-800 text-center">
                {el.verified ? (
                  <button
                    className="bg-green-600 rounded text-sm text-white py-2 px-5"
                    disabled
                  >
                    Verified
                  </button>
                ) : (
                  <article className="flex justify-center">
                    <button
                      className="bg-accentBlue rounded text-sm text-white py-2 px-5 disabled:bg-gray-800"
                      onClick={() => clickHandler(el._id)}
                      disabled={sellerId === el._id}
                    >
                      {sellerId === el._id ? "Wait..." : "Verify"}
                    </button>
                  </article>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
