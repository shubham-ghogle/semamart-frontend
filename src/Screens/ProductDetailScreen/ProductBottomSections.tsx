export default function ProductBottomSections({ product, selectedVariant }: any) {
  const STAR_COLOR = "#FFD700";

  return (
    <div className="space-y-4 mt-8">
      {[
        {
          title: "Product Highlights",
          content: (
            <ul className="space-y-1 text-base text-gray-700">
              <li className="flex justify-between items-center">
                <span>{product?.shortdescription || "No highlights available."}</span>
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white text-base">✓</span>
              </li>
            </ul>
          ),
        },
        {
          title: "Full Description",
          content: <p className="text-base text-gray-700 break-words whitespace-normal">{product?.description || "No description available."}</p>,
        },
        {
          title: "Technical Details",
          content: (
            <ul className="text-base text-gray-700 space-y-1">
              <li className="flex justify-between"><span className="font-semibold">Brand:</span> <span>{product?.manufacturerName || "N/A"}</span></li>
              <li className="flex justify-between"><span className="font-semibold">SKU:</span> <span>{product?.sku || "N/A"}</span></li>
              <li className="flex justify-between"><span className="font-semibold">HSN:</span> <span>{product?.hsn || "N/A"}</span></li>
              <li className="flex justify-between"><span className="font-semibold">Product Type:</span> <span>{product?.productType || "N/A"}</span></li>
              <li className="flex justify-between"><span className="font-semibold">Weight:</span> <span>{product?.weight || "N/A"}</span></li>
              <li className="flex justify-between"><span className="font-semibold">Dimensions:</span> <span>{product?.dimension || "N/A"}</span></li>
              <li className="flex justify-between"><span className="font-semibold">Unit:</span> <span>{product?.unitOfMeasure || "N/A"}</span></li>
              <li className="flex justify-between"><span className="font-semibold">Stock:</span> <span>{selectedVariant?.stock ?? product?.stock ?? "N/A"}</span></li>
              <li className="flex justify-between"><span className="font-semibold">Delivery Lead Time:</span> <span>{product?.deliveryLeadTime || "N/A"}</span></li>
              <li className="flex justify-between"><span className="font-semibold">Expiry:</span> <span>{product?.expiry ? new Date(product.expiry).toLocaleDateString() : "N/A"}</span></li>
            </ul>
          ),
        },
        {
          title: "Customer Reviews",
          content:
            product?.reviews?.length === 0 ? (
              <p className="text-base text-gray-500">No reviews yet.</p>
            ) : (
              <div className="flex gap-4 items-center mb-1">
                <img src="https://i.pravatar.cc/40" alt="avatar" className="w-12 h-12 rounded-full" />
                <div>
                  <div className="font-semibold">User</div>
                  <div style={{ color: STAR_COLOR }}>★★★★★</div>
                  <p className="text-base text-gray-700 mt-1">Review goes here...</p>
                </div>
              </div>
            ),
        },
      ].map((section, idx) => (
        <details key={idx} className="border rounded-lg bg-gray-50 shadow-sm open:shadow-md">
          <summary className="cursor-pointer px-4 py-3 text-lg font-semibold text-[#1C647C] select-none">
            {section.title}
          </summary>
          <div className="px-4 pb-4">{section.content}</div>
        </details>
      ))}
    </div>
  );
}
