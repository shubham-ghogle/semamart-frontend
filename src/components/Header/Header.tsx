import { Link, useNavigate } from "react-router-dom";
import { ActionBtn, SecondryBtn } from "../UI/Buttons";
import { Product } from "../../Types/types"; // adjust path to your types.ts
import {
  AiOutlineHeart,
  AiOutlineShoppingCart,
  AiOutlineSearch,
  AiOutlineHome,
  AiOutlineUser,
} from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import { Logo } from "../UI/Logo";
import { useUserStore } from "../../store/userStore";
import { useSellerStore } from "../../store/sellerStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import Wishlist from "./Wishlist";
import Cart from "./Cart";
import { useEffect, useState, useRef } from "react";

const BASE_URL = "http://localhost:8000";

export default function Header() {
  const cart = useCartStore((state) => state.cart) || [];
  const wishlist = useWishlistStore((state) => state.wishlist) || [];
  const { user, removeUser } = useUserStore((state) => state);
  const { seller, removeSeller } = useSellerStore((state) => state);
  const isAdmin = user && user.role === "Admin";
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const navigate = useNavigate();

  // New search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced fetch for suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSug(false);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v2/product/search?q=${encodeURIComponent(query)}`);
        const { products } = await res.json();
        setSuggestions(products);
        setShowSug(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Close suggestions when clicking outside the search area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSug(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function openCartHandler() {
    setIsCartOpen((prev) => !prev);
  }

  function openWishlistHandler() {
    setIsWishlistOpen((prev) => !prev);
  }

  async function logoutHandler() {
    try {
      let url = "/api/v2/user/logout";
      if (seller) {
        url = "/api/v2/shop/logout";
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Something went wrong");
      removeUser();
      removeSeller();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <header className="w-11/12 mx-auto flex items-center justify-between h-24">
      {/* 1) Logo */}
      <Logo />

      {/* 2) Search Bar */}
      <article className="w-[600px] relative" ref={containerRef}>
        <div className="flex items-center bg-[#f1f5f9] rounded-[10px] px-4 py-3 shadow-md">
          <AiOutlineSearch size={22} className="text-gray-500 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
              } else if (e.key === "ArrowUp") {
                setActiveIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                if (suggestions[activeIdx]) {
                  navigate(`/product/${suggestions[activeIdx]._id}`);
                  setShowSug(false);
                } else if (query.trim()) {
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                  setShowSug(false);
                }
              }
            }}
            placeholder="Search for Products, Brands and More"
            className="w-full bg-transparent outline-none text-base placeholder:text-gray-500"
          />
        </div>

        {showSug && suggestions.length > 0 && (
          <ul className="absolute z-20 w-full bg-white mt-2 rounded-md shadow-lg max-h-72 overflow-auto border border-gray-200">
            {suggestions.map((p, i) => (
              <li
                key={p._id}
                onClick={() => {
                  navigate(`/product/${p._id}`);
                  setShowSug(false);
                }}
                className={`flex items-center gap-3 p-3 cursor-pointer ${
                  i === activeIdx ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <img
                  src="/image60.png"
                  alt={p.name}
                  className="w-12 h-12 object-contain bg-gray-100 rounded"
                />
                <div className="flex flex-col text-sm">
                  <span className="font-semibold text-gray-800 line-clamp-1">{p.name}</span>
                  <span className="text-gray-500 text-xs">{p.category}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>

      {/* 3) Right-hand group: Become Seller + Icons */}
      <div className="flex items-center gap-4">
        {!user && !seller ? (
          <Link to="/signup-seller">
            <ActionBtn>
              Become Seller
              <IoIosArrowForward className="ml-1" />
            </ActionBtn>
          </Link>
        ) : (
          <SecondryBtn width={100} onClick={logoutHandler}>
            Logout
          </SecondryBtn>
        )}

        <section className="flex items-center gap-4">
          {/* Home Icon */}
          <Link to="/">
            <div className="bg-[#006666] p-2 rounded-full">
              <AiOutlineHome size={24} color="white" />
            </div>
          </Link>

          {/* Cart */}
          <button onClick={openCartHandler}>
            <div className="relative bg-[#006666] p-2 rounded-full">
              <AiOutlineShoppingCart size={24} color="white" />
              <span className="absolute -top-1 -right-1 rounded-full bg-[#3bc177] w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center">
                {cart.length}
              </span>
            </div>
          </button>

          {/* Wishlist */}
          <button onClick={openWishlistHandler}>
            <div className="relative bg-[#006666] p-2 rounded-full">
              <AiOutlineHeart size={24} color="white" />
              <span className="absolute -top-1 -right-1 rounded-full bg-[#3bc177] w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center">
                {wishlist.length}
              </span>
            </div>
          </button>

          {/* Profile Avatar or Login */}
          <figure>
            <div className="relative bg-[#006666] p-2 rounded-full">
              {user || seller ? (
                <section className="flex items-center gap-2">
                  {seller && (
                    <Link to="/seller">
                      <ProfileAvatar src={seller.avatar} />
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin">
                      <ProfileAvatar src={user.avatar} />
                    </Link>
                  )}
                  {user && !isAdmin && (
                    <Link to="/user">
                      <ProfileAvatar src={user.avatar} />
                    </Link>
                  )}
                </section>
              ) : (
                <Link to="/login">
                  <AiOutlineUser size={24} color="white" />
                </Link>
              )}
            </div>
          </figure>
        </section>
      </div>

      {/* Conditionally Rendered Cart and Wishlist */}
      {isCartOpen && <Cart cartOpenHandler={openCartHandler} />}
      {isWishlistOpen && <Wishlist wishlistOpenHandler={openWishlistHandler} />}
    </header>
  );
}

// ProfileAvatar component
type ProfileAvatarProps = {
  src?: string;
};

function ProfileAvatar({ src }: ProfileAvatarProps) {
  const imageUrl = src ? `${BASE_URL}/${src}` : "/placeholder.png";
  return (
    <img
      src={imageUrl}
      alt="profile avatar"
      className="w-[35px] h-[35px] rounded-full border bg-white"
      width={35}
    />
  );
}
