import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Seller } from "../../../Types/types"; // existing Seller type
import { TableBodyCell, TableHeader, TableWrapper } from "../../UIComponents/Table";

const headers = ["Seller Name", "Business Name", "Email", "Actions"];

type AdminRequestTableParams = {
  sellers: Seller[];
};

export default function AdminRequestTable({ sellers }: AdminRequestTableParams) {
  const qClient = useQueryClient();

  const { mutateAsync, variables: currentSellerId } = useMutation({
    mutationFn: async function (sellerId: string) {
      const response = await fetch("/api/v2/shop/verify-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      });

      if (!response.ok) throw new Error();
      return await response.json();
    },
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: ["sellerRequests"] });
      qClient.invalidateQueries({ queryKey: ["verifiedRequests"] });
    },
  });

  async function clickHandler(id: string) {
    await mutateAsync(id);
  }

  return (
    <TableWrapper>
      <TableHeader headers={headers} />
      <tbody>
        {sellers.map((el) => (
          <tr key={el._id}>
            <TableBodyCell text={`${el.firstName} ${el.lastName}`} />
            <TableBodyCell text={el.businessName || "n/a"} />
            <TableBodyCell text={el.email} />
            <td className="p-4 text-slate-800 text-center">
              {el.verified ? (
                <button className="bg-green-600 rounded-sm text-sm text-white py-2 px-5" disabled>
                  Verified
                </button>
              ) : (
                <div className="flex justify-center">
                  <button
                    className="bg-accent-blue rounded-sm text-sm text-white py-2 px-5 disabled:bg-gray-800"
                    onClick={() => clickHandler(el._id)}
                    disabled={currentSellerId === el._id}
                  >
                    {currentSellerId === el._id ? "Wait..." : "Verify"}
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
}
