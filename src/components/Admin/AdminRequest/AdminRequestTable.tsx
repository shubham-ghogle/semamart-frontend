import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Seller } from "../../../Types/types";

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
      qClient.invalidateQueries({ queryKey: ["seller-requests"] });
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
    <table className="w-full max-w-4xl bg-white mx-auto table-auto border-collapse">
      <AdminRequestTableHeader headers={headers} />
      <tbody>
        {sellers.map((el) => (
          <tr key={el._id}>
            <td className="p-4 border border-darkBlue text-slate-800">
              {el.firstName + " " + el.lastName}
            </td>
            <td className="p-4 border border-darkBlue text-slate-800">
              {el.businessName || "n/a"}
            </td>
            <td className="p-4 border border-darkBlue text-slate-800">
              {el.email}
            </td>
            <td className="p-4 border border-darkBlue text-slate-800 text-center">
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
  );
}

type HeaderParams = {
  headers: string[];
};
function AdminRequestTableHeader({ headers }: HeaderParams) {
  return (
    <thead>
      <tr>
        {headers.map((el) => (
          <th
            key={el}
            className="p-4 border border-darkBlue text-darkBlue bg-white text-lg"
          >
            {el}
          </th>
        ))}
      </tr>
    </thead>
  );
}
