import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, BASE_URL } from "@/data";


// ------------------ TYPES ------------------

type VariantDetails = {
  _id: string;
  thumbnail?: string | null;
  originalPrice: number;
  discountPrice: number;
  colorOption?: string;
  size?: string;
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
  totalPrice?: number;
  status?: "Delivered" | "Cancelled" | "Pending";
  deliveredAt?: string;
};

type ApiResponse = {
  success: boolean;
  count: number;
  products: Product[];
  
};

type UserInfo = {
  firstName: string;
  lastName: string;
};

type UserApiResponse = {
  success: boolean;
  user: UserInfo;
};

type Status = "pending" | "success" | "error";

// ------------------ COMPONENT ------------------

const OrderProductCard: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>("pending");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ------------------ FETCH PRODUCTS ------------------
  useEffect(() => {
    if (!userId) return;

    const fetchProducts = async () => {
      setStatus("pending");
      try {
        const response = await fetch(`${API_URL}user/${userId}/products`);
        const data: ApiResponse = await response.json();

        if (data.success) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }

        setStatus("success");
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to load products.");
        setStatus("error");
      }
    };

    fetchProducts();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchUserInfo = async () => {
      setStatus("pending");
      try {
        const response = await fetch(`${API_URL}user/user-info/${userId}`);
        const data: UserApiResponse = await response.json();
         
        if (data.success) {
          setUser(data.user);
          setStatus("success");
        } else {
          setUser(null);
          setErrorMessage("User not found.");
          setStatus("error");
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to fetch user info.");
        setStatus("error");
      }
    };

    fetchUserInfo();
  }, [userId]);

  // ------------------ FILTER PRODUCTS ------------------
  const filteredProducts = products.filter((product) =>
    product.productDetails?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );



  const handleOrderClick = (productId: string) => {
  navigate(`/admin/users/order/${productId}`);
};
  // ------------------ RENDER ------------------
  return (
    <div className="flex-1 px-4 sm:px-6 py-4">
      <div className="mx-auto bg-white rounded-2xl shadow-md max-w-[1100px] pb-6">
        {/* Header */}
        <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Ordered Products
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Products ordered by {user?.firstName} {user?.lastName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* SEARCH BOX */}
            <input
              type="text"
              placeholder="Search by product name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* GO BACK BUTTON */}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Go Back
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[calc(100vh-160px)] overflow-auto">
          {/* LOADING */}
          {status === "pending" && (
            <div className="flex justify-center py-10">
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
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            </div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {errorMessage || "Something went wrong."}
            </div>
          )}

          {/* EMPTY */}
          {status === "success" && filteredProducts.length === 0 && (
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold text-gray-700">
                No products found
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                No products match your search.
              </p>
            </div>
          )}

          {/* PRODUCTS LIST */}
          {status === "success" &&
            filteredProducts.map((product) => {
              const variant = product.variantDetails;
              const details = product.productDetails;

              const imageSrc = variant?.thumbnail
                ? `${BASE_URL}images/${variant.thumbnail}`
                : "/image60.png";

              return (
                <div
                  key={product._id}
                  onClick={() => handleOrderClick(product._id)}
                  className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-4 cursor-pointer"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                    {/* IMAGE */}
                    <div className="md:col-span-2 flex justify-center md:justify-start">
                      <img
                        src={imageSrc}
                        alt={details?.name || "Product Image"}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>

                    {/* NAME & VARIANTS */}
                    <div className="md:col-span-5">
                      <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
                        {details?.name?.split(" ").slice(0, 8).join(" ")}
                        {details?.name?.split(" ").length! > 8 && "..."}
                      </h3>

                      <div className="text-gray-600 text-sm mt-1">
                        {variant?.colorOption && (
                          <span>
                            Color:{" "}
                            <span className="font-medium text-gray-700">
                              {variant.colorOption}
                            </span>
                          </span>
                        )}
                        {variant?.size && (
                          <span className="ml-4">
                            Size:{" "}
                            <span className="font-medium text-gray-700">
                              {variant.size}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="md:col-span-2 text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{product.totalPrice || variant?.discountPrice || 0}
                      </p>
                    </div>

                    {/* STATUS & REVIEW */}
                    <div className="md:col-span-3 text-sm text-right">
                      <div className="font-medium text-gray-800">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
                            product.status === "Delivered"
                              ? "bg-green-500"
                              : product.status === "Cancelled"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        ></span>
                        {product.status || "Pending"}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        {product.status === "Delivered"
                          ? `Delivered on ${new Date(
                              product.deliveredAt || ""
                            ).toLocaleDateString()}`
                          : `Your item is ${product.status?.toLowerCase() || "pending"}`}
                      </p>

                      <button className="text-blue-600 hover:underline text-sm font-medium mt-2 inline-flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-4 h-4 text-blue-600"
                        >
                          <path d="M12 17.27L18.18 21l-1.63-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.45 4.73L5.82 21z" />
                        </svg>
                        Rate & Review
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default OrderProductCard;
