import React, { useEffect, useState } from "react";
import { Seller, getAllSellers } from "./Admin.HooksAndUtils";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminNewVendor: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const sellersData = await getAllSellers();
      setSellers(sellersData.sellers);
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

  if (loading) return <p>Loading sellers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Sellers</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Business Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Verified</th>
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
                    {seller.verified ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/admin/vendors/${seller._id}`)}
                    >
                      <EyeIcon className="w-5 h-5 text-gray-600" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4">
                  No sellers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminNewVendor;
