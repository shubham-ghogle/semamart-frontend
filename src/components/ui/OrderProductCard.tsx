// src/components/Admin/AdminProductsPage.tsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "@/data";

type VariantDetails = {
  _id: string;
  thumbnail?: string | null;
  originalPrice: number;
  discountPrice: number;
};

type ProductDetails = {
  _id: string;
  name: string;
  images?: string[];
  ratings?: number;
};

type Product = {
  _id: string;
  variantDetails?: VariantDetails;
  productDetails?: ProductDetails;
};

type ApiResponse = {
  success: boolean;
  count: number;
  products: Product[];
};

type Status = "pending" | "success" | "error";

const OrderProductCard: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>("pending");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!userId) return;

    const fetchProducts = async () => {
      setStatus("pending");
      try {
        const response = await fetch(`/api/v2/user/${userId}/products`,{
        });
        const data: ApiResponse = await response.json();
        if (data.success) {
          setProducts(data.products);
          setStatus("success");
        } else {
          setProducts([]);
          setStatus("success");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setErrorMessage("Failed to load products.");
        setStatus("error");
      }
    };

    fetchProducts();
  }, [userId]);

  return (
    <div className="flex-1 px-4 sm:px-6 py-4">
      <div className="mx-auto bg-white rounded-2xl shadow-md overflow-visible max-w-[1100px] pb-6">

        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Order Products</h1>
            <p className="text-sm text-gray-500 mt-1">Manage the Admin account</p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path>
            </svg>
            Go Back
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[calc(100vh-160px)] overflow-auto">
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
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10 text-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-700">No products ordered yet</h2>
              <p className="text-gray-500 text-sm">This user hasn’t ordered any products yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-start">
              {products.map((product) => {
                const variant = product.variantDetails;
                const info = product.productDetails;


                  const imageSrc = variant?.thumbnail
                    ? `${BASE_URL}images/${variant.thumbnail}`
                    : "/image60.png";

                const discountPct =
                  variant && variant.originalPrice
                    ? Math.round(
                        ((variant.originalPrice - variant.discountPrice) / variant.originalPrice) * 100
                      )
                    : 0;

                return (
                  <article
                    key={product._id}
                    className="relative border rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 duration-300 overflow-hidden flex flex-col p-4 w-[220px] h-[380px]"
                  >
                    {discountPct > 0 && (
                      <span className="absolute top-3 right-3 font-montserrat border-[#DF848E] border-2 text-[#DF848E] text-[10px] px-2 py-1 rounded-md z-10">
                        -{discountPct}%
                      </span>
                    )}

                    <Link to={`/product/${product._id}`} className="flex flex-col gap-2 w-full h-full">
                      <div className="w-full h-48 flex items-center justify-center mb-2">
                        <img
                          src={imageSrc}
                          alt={info?.name}
                          className="object-contain max-h-full max-w-full rounded-xl"
                        />
                      </div>

                      <div className="w-full flex flex-col justify-between flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1 break-words max-w-[200px] font-montserrat">
                          {info?.name || "Unnamed Product"}
                        </h3>

                        <div className="flex gap-1 text-[#FF9529] text-sm mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < Math.round(info?.ratings ?? 0) ? "★" : "☆"}</span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {variant ? (
                            <>
                              <span className="text-xs text-gray-400 line-through font-montserrat">
                                ₹{variant.originalPrice}
                              </span>
                              <span className="font-medium text-lg font-montserrat text-[#2F3B54]">
                                ₹{variant.discountPrice}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium text-lg font-montserrat text-[#2F3B54]">
                              ₹N/A
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderProductCard;
