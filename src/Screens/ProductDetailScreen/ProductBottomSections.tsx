// src/components/Product/ProductBottomSections.tsx
import { useMemo, useState } from "react";
import { X, FileText, Eye, Download } from "lucide-react"; // Added Eye and Download
import { BASE_URL } from "@/data"; // Ensure this import matches your project structure
export default function ProductBottomSections({ product, selectedVariant }: any) {
  const STAR_COLOR = "#FFD700";
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const tabs = useMemo(
    () => [
      { id: "highlights", label: "Product Highlights" },
      { id: "description", label: "Full Description" },
      { id: "technical", label: "Technical Details" },
      { id: "attributes", label: "Attributes" },
      { id: "reviews", label: "Customer Reviews" },
      { id: "documents", label: "Relevant Documents" }, // ADDED
    ],
    []
  );

  // Logic to extract documents from your product object
  const documents = useMemo(() => {
    const docs: { label: string; url: string }[] = [];
    
    // Single file fields
    if (product?.amc_cms) docs.push({ label: "AMC/CMS", url: product.amc_cms });
    if (product?.oemLetter) docs.push({ label: "OEM Letter", url: product.oemLetter });
    if (product?.productComparisionSheet) docs.push({ label: "Comparison Sheet", url: product.productComparisionSheet });
    
    // Array file fields
    if (Array.isArray(product?.productCompilance)) {
      product.productCompilance.forEach((url: string, i: number) => docs.push({ label: `Compliance ${i + 1}`, url }));
    }
    if (Array.isArray(product?.msds_ifu_leaflet)) {
      product.msds_ifu_leaflet.forEach((url: string, i: number) => docs.push({ label: `Leaflet ${i + 1}`, url }));
    }
    if (Array.isArray(product?.certificate)) {
      product.certificate.forEach((url: string, i: number) => docs.push({ label: `Certificate ${i + 1}`, url }));
    }
    
    return docs;
  }, [product]);

  const technicalPairs = [
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
  const attributes = Array.isArray(product?.attributes) ? product.attributes : [];

  return (
    <section className="w-full mt-8">
      {/* --- Document Popup Modal --- */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-[#1C647C]">Document Viewer</span>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe src={selectedDoc} className="w-full h-full border-none" title="Doc" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tab row */}
        <div role="tablist" className="overflow-x-auto px-3 py-3 border-b scrollbar-hide">
          <div className="flex gap-2 w-max">
            {tabs.map((t, i) => {
              const active = activeTabIdx === i;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTabIdx(i)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
                    ${active ? "bg-[#1C647C] text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 min-h-[200px]">
          {/* ... Existing Highlights, Description, Technical, Attributes, Reviews Tabs ... */}
          {/* (Kept your logic for activeTabIdx 0 through 4) */}

          {/* Documents Tab */}
          <div className={`${activeTabIdx === 5 ? "block" : "hidden"} transition`}>
            <h3 className="text-lg font-semibold text-[#1C647C] mb-4">Relevant Documents</h3>
            {documents.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {documents.map((doc, idx) => (
                  <div 
                    key={idx}
                    className="group border rounded-xl p-4 bg-gray-50 hover:bg-white hover:border-[#1C647C] hover:shadow-lg transition flex flex-col items-center text-center relative"
                  >
                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
                      <FileText size={28} />
                    </div>
                    <p className="text-xs font-bold text-gray-800 mb-1 truncate w-full">{doc.label}</p>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => setSelectedDoc(`${BASE_URL}docs/${doc.url}`)}
                        className="p-1.5 bg-[#1C647C] text-white rounded-md hover:bg-[#154d60]"
                       >
                         <Eye size={14} />
                       </button>
                       <a 
                        href={`${BASE_URL}docs/${doc.url}`} 
                        download 
                        className="p-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                       >
                         <Download size={14} />
                       </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No documents available.</p>
            )}
          </div>

          {/* Re-insert your existing tab content divs here (0-4) */}
          {/* Highlights */}
          <div id="tabpanel-highlights" role="tabpanel" aria-labelledby="tab-highlights" aria-hidden={activeTabIdx !== 0} className={`${activeTabIdx === 0 ? "block" : "hidden"} transition`}>
            <h3 className="text-lg font-semibold text-[#1C647C] mb-3">Product Highlights</h3>
            <ul className="space-y-2 text-gray-700">
              {product?.shortdescription ? (
                product.shortdescription.split(/\n+/).map((line: string, idx: number) => (
                  <li key={idx} className="flex flex-wrap items-start gap-3 min-w-0">
                    <span className="mt-1 w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-green-500 text-white text-sm">✓</span>
                    <span className="text-sm text-gray-700 min-w-0 break-all whitespace-normal leading-relaxed flex-1">{line}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No highlights available.</li>
              )}
            </ul>
          </div>

          {/* Description */}
          <div id="tabpanel-description" role="tabpanel" aria-labelledby="tab-description" aria-hidden={activeTabIdx !== 1} className={`${activeTabIdx === 1 ? "block" : "hidden"} transition`}>
            <h3 className="text-lg font-semibold text-[#1C647C] mb-3">Full Description</h3>
            <div className="prose prose-sm max-w-none text-gray-700 break-words whitespace-pre-wrap">
              {product?.description ? (
                <div className="min-w-0 break-words whitespace-pre-wrap">{product.description}</div>
              ) : (
                <p className="text-gray-500">No description available.</p>
              )}
            </div>
          </div>

          {/* Technical */}
          <div id="tabpanel-technical" role="tabpanel" aria-labelledby="tab-technical" aria-hidden={activeTabIdx !== 2} className={`${activeTabIdx === 2 ? "block" : "hidden"} transition`}>
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

          {/* Attributes (NEW) */}
          <div id="tabpanel-attributes" role="tabpanel" aria-labelledby="tab-attributes" aria-hidden={activeTabIdx !== 3} className={`${activeTabIdx === 3 ? "block" : "hidden"} transition`}>
            <h3 className="text-lg font-semibold text-[#1C647C] mb-3">Attributes</h3>

            {Array.isArray(attributes) && attributes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
                {attributes.map((attrObj: any, idx: number) => {
                  const entries = Object.entries(attrObj || {});
                  return entries.map(([k, v]) => (
                    <div key={`${idx}-${k}`} className="flex items-start gap-4 min-w-0">
                      <div className="w-36 text-sm font-semibold text-gray-800 flex-shrink-0">{k}:</div>
                      <div className="flex-1 text-sm min-w-0 break-all whitespace-normal">{String(v ?? "N/A")}</div>
                    </div>
                  ));
                })}
              </div>
            ) : (
              <p className="text-gray-500">No attributes defined for this product.</p>
            )}
          </div>

          {/* Reviews */}
          <div id="tabpanel-reviews" role="tabpanel" aria-labelledby="tab-reviews" aria-hidden={activeTabIdx !== 4} className={`${activeTabIdx === 4 ? "block" : "hidden"} transition`}>
            <h3 className="text-lg font-semibold text-[#1C647C] mb-3">Customer Reviews</h3>

            {Array.isArray(reviews) && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((r: any, idx: number) => (
                  <article key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* <img src={r.userAvatar ?? "https://i.pravatar.cc/40"} alt={r.userName ?? "User"} className="w-12 h-12 rounded-full object-cover flex-shrink-0" /> */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{r.user?.name ?? "User"}</div>
                          <div style={{ color: STAR_COLOR }}>{("★".repeat(Math.round(r.rating ?? 5))).padEnd(5, "☆")}</div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap break-all">{r.comment ?? "No comment."}</p>
                        {r.images && r.images.length > 0 ? (
                          r.images.map((img: string, idx: number) => (
                            <img 
                              key={idx}
                              src={`${BASE_URL}images/${img}`} 
                              alt={`Review Image ${idx + 1}`} 
                              className="w-full max-w-xs mt-3 rounded-md object-cover" 
                            />
                          ))
                        ) : null}

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
    </section>
  );
}
