import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { API_URL, BASE_URL } from "@/data";
import { error } from "console";

type Variant = {
  _id: string;
  thumbnail?: string | null;
  originalPrice: number;
  discountPrice: number;
  size?: string;
  colorOption?: string;
};

type Product = {
  _id: string;
  name: string;
  images: string[];
  ratings?: number;
  brand?: string;
};

type CartItem = {
  _id: string;
  qty: number;
  product_id: Product;
  variant_id: Variant;
};

type ApiResponse = {
  success: boolean;
  data: CartItem[];
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

const UserCart: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [status, setStatus] = useState<Status>("pending");

  useEffect(() => {
    if (!userId) return;

    const fetchCart = async () => {
      setStatus("pending");

      try {
        const response = await fetch(API_URL+`cart/${userId}`);
        const data: ApiResponse = await response.json();

        if (data.success) {
          setItems(data.data);
          setStatus("success");
        } else {
          setItems([]);
          setStatus("success");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        setStatus("error");
      }
    };

    fetchCart();
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
            setStatus("error");
          }
        } catch (error) {
          console.error(error);
          setStatus("error");
        }
      };
  
      fetchUserInfo();
    }, [userId]);

  return (
    <div className="flex-1 px-4 sm:px-6 py-4">
      <div className="mx-auto bg-white rounded-2xl shadow-md overflow-visible max-w-[1100px] pb-6">

        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              User Cart Items
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Viewing all items in the {user?.firstName} {user?.lastName} Cart
            </p>
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
              Failed to load cart items.
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10 text-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-700">No items in cart</h2>
              <p className="text-gray-500 text-sm">User has not added anything to cart yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-start">
              {items.map((item) => {
                const p = item.product_id;
                const v = item.variant_id;

                const imageSrc = v.thumbnail
                  ? `${BASE_URL}images/${v.thumbnail}`
                  : "/image60.png";

                const discountPct =
                  v && v.originalPrice
                    ? Math.round(((v.originalPrice - v.discountPrice) / v.originalPrice) * 100)
                    : 0;

                return (
                  <article
                    key={item._id}
                    className="relative border rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 duration-300 overflow-hidden flex flex-col p-4 w-[220px] h-[390px]"
                  >
                    {discountPct > 0 && (
                      <span className="absolute top-3 right-3 font-montserrat border-[#DF848E] border-2 text-[#DF848E] text-[10px] px-2 py-1 rounded-md z-10">
                        -{discountPct}%
                      </span>
                    )}

                    <Link to={`/product/${p._id}`} className="flex flex-col gap-2 w-full h-full">
                      <div className="w-full h-48 flex items-center justify-center mb-2">
                        <img
                          src={imageSrc}
                          alt={p.name}
                          className="object-contain max-h-full max-w-full rounded-xl"
                        />
                      </div>

                      <div className="flex flex-col justify-between flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1 break-words max-w-[200px] font-montserrat">
                          {p.name}
                        </h3>

                        <p className="text-xs text-gray-500">
                          Qty: <span className="font-medium">{item.qty}</span>
                        </p>

                        <div className="flex gap-1 text-[#FF9529] text-sm mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < Math.round(p.ratings ?? 0) ? "★" : "☆"}</span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400 line-through font-montserrat">
                            ₹{v.originalPrice}
                          </span>
                          <span className="font-medium text-lg font-montserrat text-[#2F3B54]">
                            ₹{v.discountPrice}
                          </span>
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

export default UserCart;
