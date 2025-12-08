import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  businessType?: string;
  gstNumber: string;
  createdAt?: string;
}

interface SellerResponse {
  seller: Seller;
}

const AdminSellerAccount: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sellerId) {
      setError("Seller ID is missing from URL");
      setLoading(false);
      return;
    }

    const fetchSeller = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v2/shop/getSeller/${sellerId}`);
        if (!res.ok) throw new Error(`Failed to fetch seller with ID: ${sellerId}`);
        const data: SellerResponse = await res.json();
        setSeller(data.seller);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [sellerId]);

  const formattedDate = useMemo(
    () => (seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "—"),
    [seller?.createdAt]
  );

  if (loading)
    return (
      <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg animate-pulse space-y-4">
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );

  if (error) return <p className="text-red-600 text-center mt-8 font-medium">{error}</p>;
  if (!seller) return <p className="text-center mt-8 font-medium">Seller not found.</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Seller Profile</h1>
        <span className="text-gray-500 font-medium">
          Member Since: <span className="text-gray-800">{formattedDate}</span>
        </span>
      </div>

      {/* Seller Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <dt className="text-gray-500 font-medium">Name</dt>
          <dd className="mt-1 text-gray-800 text-lg">{seller.firstName} {seller.lastName}</dd>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <dt className="text-gray-500 font-medium">Email</dt>
          <dd className="mt-1 text-gray-800 text-lg">{seller.email}</dd>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <dt className="text-gray-500 font-medium">Phone</dt>
          <dd className="mt-1 text-gray-800 text-lg">{seller.phoneNumber}</dd>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <dt className="text-gray-500 font-medium">Business Name</dt>
          <dd className="mt-1 text-gray-800 text-lg">{seller.businessName}</dd>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <dt className="text-gray-500 font-medium">Business Type</dt>
          <dd className="mt-1 text-gray-800 text-lg">{seller.businessType || "—"}</dd>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <dt className="text-gray-500 font-medium">GST Number</dt>
          <dd className="mt-1 text-gray-800 text-lg">{seller.gstNumber}</dd>
        </div>
      </div>

      {/* Go Back Button */}
      <div className="mt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition-colors"
        >
          {/* Left arrow */}
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default AdminSellerAccount;
