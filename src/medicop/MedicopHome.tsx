import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MEDICOP_PRODUCTS } from "./data";
import { getMedicopList, toggleMedicopItem } from "./storage";

export default function MedicopHome() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const list = getMedicopList();
    return list.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.productId] = true;
      return acc;
    }, {});
  });

  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  );

  return (
    <section className="w-full bg-gray-100 min-h-screen py-8">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1C647C]">Mediqop Medical Manager</h1>
              <p className="text-sm text-gray-600 mt-1">
                Dummy medical catalog for requirement generation flow.
              </p>
            </div>
            <div className="text-sm font-medium text-gray-700">
              Selected: <span className="text-[#1C647C] font-bold">{selectedCount}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MEDICOP_PRODUCTS.map((product) => {
            const checked = Boolean(selected[product.id]);
            return (
              <article
                key={product.id}
                role="button"
                onClick={() => navigate(`/medicop/product/${product.id}`)}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-4 cursor-pointer"
              >
                <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-xs uppercase tracking-wide text-gray-500">{product.category}</p>
                <h3 className="text-base font-semibold text-gray-900 mt-1 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                <p className="text-sm text-[#1C647C] font-medium mt-2">MOQ: {product.moq}</p>

                <label
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1C647C]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const nextChecked = e.target.checked;
                      toggleMedicopItem(product.id, nextChecked);
                      setSelected((prev) => ({ ...prev, [product.id]: nextChecked }));
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-[#1C647C] focus:ring-[#1C647C]"
                  />
                  Tick for list
                </label>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
