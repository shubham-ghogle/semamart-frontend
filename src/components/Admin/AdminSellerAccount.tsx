import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";

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

    const formattedDate = useMemo(() => {
      if (!seller?.createdAt) return "—";
      return new Date(seller.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",   // <-- gives "Dec"
        year: "numeric",
      });
    }, [seller?.createdAt]);

  

  return (
    <AdminMainWrapper
      status={loading ? "pending" : error ? "error" : "success"}
      errorMeassage={error}
      heading="Seller Profile"
    >
      {!loading && !error && seller && (
        <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">Seller Information</h2>
            <span className="text-gray-600 font-medium">
              Member Since: <span className="text-gray-800">{formattedDate}</span>
            </span>
          </div>

          {/* Seller Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <dt className="text-gray-500 font-medium">Name</dt>
              <dd className="mt-1 text-gray-800 text-lg">
                {seller.firstName} {seller.lastName}
              </dd>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <dt className="text-gray-500 font-medium">Email</dt>
              <dd className="mt-1 text-gray-800 text-lg">{seller.email}</dd>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <dt className="text-gray-500 font-medium">Phone</dt>
              <dd className="mt-1 text-gray-800 text-lg">{seller.phoneNumber}</dd>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <dt className="text-gray-500 font-medium">Business Name</dt>
              <dd className="mt-1 text-gray-800 text-lg">{seller.businessName}</dd>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <dt className="text-gray-500 font-medium">Business Type</dt>
              <dd className="mt-1 text-gray-800 text-lg">{seller.businessType || "—"}</dd>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <dt className="text-gray-500 font-medium">GST Number</dt>
              <dd className="mt-1 text-gray-800 text-lg">{seller.gstNumber}</dd>
            </div>
          </div>
        </div>
      )}
    </AdminMainWrapper>
  );
};

export default AdminSellerAccount;
