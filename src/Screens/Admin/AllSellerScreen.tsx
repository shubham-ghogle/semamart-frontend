import React, { useEffect, useState } from "react";
import { getAllSellers, deleteSeller, getAllOrders } from "./Admin.HooksAndUtils"; // Added getAllOrders
import AdminSellerTable from "@/components/Admin/AdminSellerTable";
import { Seller, Order } from "@/Types/types"; // Added Order type
import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";
import { toast } from "react-toastify";

const AllSellerScreen: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<Order[]>([]); // Added state for orders
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both sellers and orders to satisfy the Net Revenue calculation
      const [sellersData, ordersData] = await Promise.all([
        getAllSellers(),
        getAllOrders()
      ]);

      // ✅ filter verified sellers only
      const verifiedSellers = sellersData.sellers.filter(
        (seller: Seller) => seller.verified === true
      );

      setSellers(verifiedSellers);
      setOrders(ordersData.orders || []); // Set orders state
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setSellers([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteSeller = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this seller?")) return;
    try {
      await deleteSeller(id);
      setSellers((prev) => prev.filter((seller) => seller._id !== id));
      toast.success("Seller deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete seller");
    }
  };

  if (loading) return <AdminMainWrapper status="pending" heading="Verified Sellers" />;
  if (error) return <p className="text-red-500 p-8">{error}</p>;

  return (
    <AdminMainWrapper
      status="success"
      heading="Verified Sellers"
      errorMeassage={error}
    >
      <AdminSellerTable 
        sellers={sellers} 
        allOrders={orders} 
        onDeleteSeller={handleDeleteSeller}
      />
    </AdminMainWrapper>
  );
};

export default AllSellerScreen;
