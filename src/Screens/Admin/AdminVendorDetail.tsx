import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {  getSellerById } from "./Admin.HooksAndUtils";
import { Seller } from "@/Types/types";

const AdminVendorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setLoading(true);
        const data = await getSellerById(id!);
        setSeller(data.seller);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  if (loading) return <p>Loading seller details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!seller) return <p>Seller not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Seller Details</h1>

      {/* Profile banner */}
      {seller.banner && (
        <img
          src={seller.banner}
          alt="Seller Banner"
          className="w-full h-48 object-cover rounded-md mb-6"
        />
      )}

      <div className="flex items-center gap-4 mb-6">
        {seller.profilePic || seller.avatar ? (
          <img
            src={seller.profilePic || seller.avatar}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            N/A
          </div>
        )}
        <h2 className="text-2xl font-semibold">
          {seller.firstName} {seller.lastName}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-gray-600 text-sm">Business Name</h3>
          <p className="text-lg font-semibold">{seller.businessName || "n/a"}</p>
        </div>

        <div>
          <h3 className="text-gray-600 text-sm">Business Type</h3>
          <p className="text-lg font-semibold">{seller.businessType || "n/a"}</p>
        </div>

        <div>
          <h3 className="text-gray-600 text-sm">GST Number</h3>
          <p className="text-lg font-semibold">{seller.gstNumber || "n/a"}</p>
        </div>

        <div>
          <h3 className="text-gray-600 text-sm">Email</h3>
          <p className="text-lg font-semibold">{seller.email}</p>
        </div>

        <div>
          <h3 className="text-gray-600 text-sm">Phone</h3>
          <p className="text-lg font-semibold">{seller.phoneNumber || "n/a"}</p>
        </div>

        <div>
          <h3 className="text-gray-600 text-sm">Address</h3>
          <p className="text-lg font-semibold">{seller.address || "n/a"}</p>
        </div>

        <div>
          <h3 className="text-gray-600 text-sm">ZIP Code</h3>
          <p className="text-lg font-semibold">{seller.zipCode || "n/a"}</p>
        </div>

        <div>
          <h3 className="text-gray-600 text-sm">Available Balance</h3>
          <p className="text-lg font-semibold">₹{seller.availableBalance.toFixed(2)}</p>
        </div>

        <div>
          <h3 className="text-gray-600 text-sm">Role</h3>
          <p className="text-lg font-semibold">{seller.role}</p>
        </div>

        <div>
          <h3 className="text-gray-600 text-sm">Verified</h3>
          <p
            className={`text-lg font-semibold ${
              seller.verified ? "text-green-600" : "text-red-600"
            }`}
          >
            {seller.verified ? "Yes" : "No"}
          </p>
        </div>

        <div>
          <h3 className="text-gray-600 text-sm">Joined At</h3>
          <p className="text-lg font-semibold">
            {new Date(seller.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminVendorDetail;
