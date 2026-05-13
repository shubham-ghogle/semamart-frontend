import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AdminMainWrapper from "../Admin/AdminMainWrapper";
import { API_URL } from "@/data";

/* ================= TYPES ================= */

interface Address {
  reciever_name: string;
  state: string;
  district: string;
  instituteAddress1: string;
  instituteAddress2?: string;
  pincode: string;
  landmark?: string;
  phone: string;
  addressType: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  instituteName: string;
  role: string;
  createdAt: string;
  isVerified: boolean;
  addresses?: Address[];
  refundBankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
  };
}

interface UserResponse {
  success: boolean;
  user: User;
}

type Status = "pending" | "success" | "error";

/* ================= COMPONENT ================= */

const AdminUserAccount: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("pending");
  const [errorMessage, setErrorMessage] = useState("");

  /* ================= FETCH USER ================= */

  useEffect(() => {
    if (!userId) {
      setErrorMessage("User ID is missing from URL");
      setStatus("error");
      return;
    }

    const fetchUser = async () => {
      try {
        setStatus("pending");

        const res = await fetch(`${API_URL}user/getUser/${userId}`,{
          credentials:"include"
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user details");
        }

        const data: UserResponse = await res.json();
        setUser(data.user);
        setStatus("success");
      } catch (err: any) {
        setErrorMessage(err.message || "Something went wrong");
        setStatus("error");
      }
    };

    fetchUser();
  }, [userId]);

  /* ================= FORMAT DATE ================= */

 const formattedDate = useMemo(() => {
  if (!user?.createdAt) return "—";
  return new Date(user.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",  // Dec, Jan, Feb...
    year: "numeric",
  });
}, [user?.createdAt]);


  /* ================= MAIN RENDER ================= */

  return (
    <AdminMainWrapper
      status={status}
      errorMeassage={errorMessage}
      heading="User Profile"
    >
      {status === "success" && user && (
        <div className="p-6">
          {/* MEMBER SINCE */}
          <div className="flex justify-end mb-6">
            <span className="text-gray-600 text-sm">
              Member Since: <strong>{formattedDate}</strong>
            </span>
          </div>

          {/* USER INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <Info label="Name" value={`${user.firstName} ${user.lastName}`} />
            <Info label="Email" value={user.email} />
            <Info label="Phone" value={user.phoneNumber} />
            <Info label="Institute" value={user.instituteName} />
            <Info label="Role" value={user.role} />
            <Info
              label="Verified"
              value={user.isVerified ? "Yes ✅" : "No ❌"}
            />
          </div>

          {/* ADDRESS */}
          {user.addresses && user.addresses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Address
              </h2>

              {user.addresses.map((addr, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-100 rounded-lg mb-3"
                >
                  <p className="font-medium text-gray-800">
                    {addr.reciever_name}
                  </p>
                  <p>{addr.instituteAddress1}</p>
                  {addr.instituteAddress2 && <p>{addr.instituteAddress2}</p>}
                  <p>
                    {addr.district}, {addr.state} - {addr.pincode}
                  </p>
                  <p>Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
          )}

          {user.refundBankDetails?.accountHolderName && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Refund Bank Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Info label="Account Holder" value={user.refundBankDetails.accountHolderName || "-"} />
                <Info label="Bank Name" value={user.refundBankDetails.bankName || "-"} />
                <Info label="Account Number" value={user.refundBankDetails.accountNumber || "-"} />
                <Info label="IFSC" value={user.refundBankDetails.ifsc || "-"} />
              </div>
            </div>
          )}
        </div>
      )}
    </AdminMainWrapper>
  );
};

/* ================= INFO COMPONENT ================= */

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="p-4 bg-gray-100 rounded-lg hover:shadow-md transition">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-lg font-medium text-gray-800">{value}</p>
  </div>
);

export default AdminUserAccount;
