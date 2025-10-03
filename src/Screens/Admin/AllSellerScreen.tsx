import React, { useEffect, useState } from "react";
import {  getAllSellers, deleteSeller } from "./Admin.HooksAndUtils";
import AdminSellerTable from "@/components/Admin/AdminSellerTable";
import { Seller } from "@/Types/types";
import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";

const AllSellerScreen: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const sellersData = await getAllSellers();

      // ✅ filter verified sellers only
      const verifiedSellers = sellersData.sellers.filter(
        (seller ) => seller.verified === true
      );

      setSellers(verifiedSellers);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setSellers([]);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleDeleteSeller = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this seller?")) return;
    try {
      await deleteSeller(id);
      setSellers((prev) => prev.filter((seller) => seller._id !== id));
      alert("Seller deleted successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading sellers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <AdminMainWrapper
      status="success"
      heading="Verified Sellers"
      errorMeassage={error}
    >
      <AdminSellerTable sellers={sellers} onDeleteSeller={handleDeleteSeller}/>
    </AdminMainWrapper>
  );
};

export default AllSellerScreen;
