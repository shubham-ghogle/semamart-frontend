// ProductBottomSections.tsx
import React, { useMemo, useState } from "react";

export default function ProductBottomSections({ product, selectedVariant }: any) {
  const STAR_COLOR = "#FFD700";

  const tabs = useMemo(
    () => [
      { id: "highlights", label: "Product Highlights" },
      { id: "description", label: "Full Description" },
      { id: "technical", label: "Technical Details" },
      { id: "reviews", label: "Customer Reviews" },
    ],
    []
  );

  const [activeTabIdx, setActiveTabIdx] = useState(0);

  const technicalPairs = [
    ["Brand", product?.manufacturerName ?? "N/A"],
    ["SKU", product?.sku ?? "N/A"],
    ["HSN", product?.hsn ?? "N/A"],
    ["Product Type", product?.productType ?? "N/A"],
    ["Weight", product?.weight ?? "N/A"],
    ["Dimensions", product?.dimension ?? "N/A"],
    ["Unit", product?.unitOfMeasure ?? "N/A"],
    ["Stock", selectedVariant?.stock ?? product?.stock ?? "N/A"],
    ["Delivery Lead Time", product?.deliveryLeadTime ?? "N/A"],
    ["Expiry", product?.expiry ? new Date(product.expiry).toLocaleDateString() : "N/A"],
  ];

  const reviews = product?.reviews ?? [];

  return (
    <section className="w-full mt-8">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="md:flex md:items-start">
          {/* Tabs: mobile horizontal and desktop vertical */}
          <div className="border-b md:border-b-0 md:border-r md:w-64">
            <div className="md:hidden overflow-x-auto">
              <div className="flex gap-3 px-3 py-3">
                {tabs.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTabIdx(i)}
                    role="tab"
                    aria-selected={activeTabIdx === i}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition 
                      ${activeTabIdx === i ? "bg-[#1C647C] text-white shadow" : "bg-gray-100 text-gray-700"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="flex flex-col p-4 gap-2">
                {tabs.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTabIdx(i)}
                    role="tab"
                    aria-selected={activeTabIdx === i}
                    className={`text-left px-4 py-3 rounded-lg transition flex items-center justify-between
                      ${activeTabIdx === i ? "bg-[#1C647C] text-white shadow-md" : "hover:bg-gray-50 text-gray-700"}`}
                  >
                    <span className="text-sm font-semibold">{t.label}</span>
                    <span className="text-sm text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content: note min-w-0 so flex children can shrink */}
          <div className="flex-1 p-4 min-w-0">
            {/* Product Highlights */}
            <div
              role="tabpanel"
              aria-hidden={activeTabIdx !== 0}
              className={`${activeTabIdx === 0 ? "block" : "hidden"} transition`}
            >
              <h3 className="text-lg font-semibold text-[#1C647C] mb-3">Product Highlights</h3>
              <ul className="space-y-2 text-gray-700">
                {product?.shortdescription ? (
                  product.shortdescription.split(/\n+/).map((line: string, idx: number) => (
                    // min-w-0 here so the flex child can shrink; break-all forces break for long unbroken strings
                    <li key={idx} className="flex flex-wrap items-start gap-3 min-w-0">
                      <span className="mt-1 w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-green-500 text-white text-sm">✓</span>
                      <span className="text-sm text-gray-700 min-w-0 break-all whitespace-normal leading-relaxed flex-1">
                        {line}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No highlights available.</li>
                )}
              </ul>
            </div>

            {/* Full Description */}
            <div
              role="tabpanel"
              aria-hidden={activeTabIdx !== 1}
              className={`${activeTabIdx === 1 ? "block" : "hidden"} transition`}
            >
              <h3 className="text-lg font-semibold text-[#1C647C] mb-3">Full Description</h3>
              <div className="prose prose-sm max-w-none text-gray-700 break-words whitespace-pre-wrap">
                {product?.description ? (
                  <div className="min-w-0 break-words whitespace-pre-wrap">{product.description}</div>
                ) : (
                  <p className="text-gray-500">No description available.</p>
                )}
              </div>
            </div>

            {/* Technical Details */}
            <div
              role="tabpanel"
              aria-hidden={activeTabIdx !== 2}
              className={`${activeTabIdx === 2 ? "block" : "hidden"} transition`}
            >
              <h3 className="text-lg font-semibold text-[#1C647C] mb-3">Technical Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-gray-700">
                {technicalPairs.map(([label, value]) => (
                  <div key={label} className="flex items-start gap-4 min-w-0">
                    <div className="w-36 text-sm font-semibold text-gray-800 flex-shrink-0">{label}:</div>
                    <div className="flex-1 text-sm min-w-0 break-all whitespace-normal">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews */}
            <div
              role="tabpanel"
              aria-hidden={activeTabIdx !== 3}
              className={`${activeTabIdx === 3 ? "block" : "hidden"} transition`}
            >
              <h3 className="text-lg font-semibold text-[#1C647C] mb-3">Customer Reviews</h3>

              {Array.isArray(reviews) && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r: any, idx: number) => (
                    <article key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={r.userAvatar ?? "https://i.pravatar.cc/40"}
                          alt={r.userName ?? "User"}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{r.userName ?? "User"}</div>
                            <div style={{ color: STAR_COLOR }}>{("★".repeat(Math.round(r.rating ?? 5))).padEnd(5, "☆")}</div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap break-all">{r.comment ?? "No comment."}</p>
                          <div className="text-xs text-gray-400 mt-2">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
