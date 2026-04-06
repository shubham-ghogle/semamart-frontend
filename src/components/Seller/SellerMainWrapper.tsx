import React from "react";
import { useNavigate } from "react-router-dom";

type Status = "pending" | "success" | "error";

export default function SellerMainWrapper({
  children,
  status,
  errorMessage,
  heading,
  subHeading
}: {
  children?: React.ReactNode;
  status: Status;
  errorMessage?: string;
  heading?: string;
  subHeading?: string;
}) {
  const navigate = useNavigate(); // ✅ must be inside the component

  // Headings that should display the "Go Back" button
  const showGoBackButton = heading === "Order Details" || heading === "Product Detail";

  return (
    <div className="flex-1 px-4 sm:px-6 py-4 w-full">
      <div className="mx-auto bg-white rounded-2xl shadow-md overflow-visible w-full pb-6">
        <div className="px-5 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              {heading || "Seller"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {subHeading || "Manage your seller account"}
            </p>
          </div>

          {showGoBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border"
            >
              ← Go Back
            </button>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[calc(100vh-160px)] sm:max-h-none overflow-auto">
          {status === "pending" ? (
            <div className="w-full flex items-center justify-center py-10">
              <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : status === "error" ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md ring-1 ring-red-100">
              {errorMessage || "Something went wrong."}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
