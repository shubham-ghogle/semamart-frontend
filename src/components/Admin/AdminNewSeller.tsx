import { useQuery } from "@tanstack/react-query";
import AdminSellerTable from "./AdminSellerTable";
import { Seller } from "@/Types/types";
import { getAllSellers } from "@/api/admin"; // same API used in AllSellerScreen

export default function AdminNewSeller() {
  const { data: sellers = [], isLoading } = useQuery<Seller[]>({
    queryKey: ["admin-sellers"],
    queryFn: getAllSellers,
  });

  const handleDeleteSeller = (id: string) => {
    // same delete logic as AllSellerScreen
  };

  // ✅ ONLY DIFFERENCE
  const newSellers = sellers.filter((s) => s.verified === false);

  if (isLoading) return <div>Loading...</div>;

  return (
    <AdminSellerTable
      sellers={newSellers}
      onDeleteSeller={handleDeleteSeller}
    />
  );
}
