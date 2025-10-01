import React, { useEffect, useState } from "react";
import { Seller, getAllSellers, deleteSeller } from "./Admin.HooksAndUtils";

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
        (seller: Seller) => seller.verified === true
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Verified Sellers</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Business Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Joined At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.length > 0 ? (
              sellers.map((seller) => (
                <tr key={seller._id} className="text-center">
                  <td className="py-2 px-4 border-b">{`${seller.firstName} ${seller.lastName}`}</td>
                  <td className="py-2 px-4 border-b">{seller.businessName || "n/a"}</td>
                  <td className="py-2 px-4 border-b">{seller.email}</td>
                  <td className="py-2 px-4 border-b">{seller.role}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDeleteSeller(seller._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4">
                  No verified sellers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllSellerScreen;
