import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MEDICOP_PRODUCT_MAP } from "./data";
import { upsertMedicopItem } from "./storage";

export default function MedicopProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = useMemo(() => (id ? MEDICOP_PRODUCT_MAP[id] : null), [id]);
  const [qty, setQty] = useState<number>(product?.moq ?? 1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Product not found.
      </div>
    );
  }

  const minimum = product.moq;

  return (
    <section className="w-full bg-white min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate("/medicop/medicophomepage")}
          className="text-sm text-[#1C647C] font-semibold mb-4"
        >
          Back to Medical Manager
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="bg-gray-50 rounded-xl h-[360px] flex items-center justify-center p-5">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="space-y-5">
            <p className="text-xs uppercase text-gray-500 tracking-wide">{product.category}</p>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>



            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Technical Details</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {product.specifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((prev) => Math.max(minimum, prev - 1))}
                className="w-9 h-9 rounded border border-gray-300"
              >
                -
              </button>
              <span className="min-w-10 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((prev) => prev + 1)}
                className="w-9 h-9 rounded border border-gray-300"
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                upsertMedicopItem(product.id, qty);
                navigate("/get-quote-admin/lead-form?mode=medicop", {
                  state: {
                    medicopProducts: [{ productId: product.id, qty }],
                  },
                });
              }}
              className="w-full text-white py-3 rounded-2xl font-semibold text-lg"
              style={{ background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)" }}
            >
              Add to list
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
