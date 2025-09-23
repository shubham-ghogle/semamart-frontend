// Header.tsx

import { Link, useNavigate } from "react-router-dom";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { BsCashStack } from "react-icons/bs";
import { FaRegCircleUser, FaUserDoctor } from "react-icons/fa6";
import { TbFileInvoice } from "react-icons/tb";
import { RiShoppingBag4Line } from "react-icons/ri";
import { MdOutlineSupportAgent } from "react-icons/md";
import { IoGiftSharp } from "react-icons/io5";
import { FaSignOutAlt } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

import { useState, useEffect, useRef } from "react";
import { Logo } from "../UIComponents/Logo";
import Wishlist from "./Wishlist";
import Cart from "./Cart";

import placeholderImg from "../../../public/image60.png";
import { Product } from "@/Types/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import { useSellerStore } from "@/store/sellerStore";

// Utility for image fallback
const PLACEHOLDER_IMG = placeholderImg;
function toImageUrl(value?: string | null) {
  if (!value) return PLACEHOLDER_IMG;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return value;
  return `/images/${value}`;
}

type Category = {
  _id: string;
  name: string;
};

type Subcategory = {
  _id: string;
  name: string;
};



export default function Header() {
 const cart = useCartStore((state) => state.cart) || [];
  const wishlist = useWishlistStore((state) => state.wishlist) || [];
  const { user, removeUser } = useUserStore((state) => state);
  const { seller, removeSeller } = useSellerStore((state) => state);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [subcategoryMap, setSubcategoryMap] = useState<Record<string, Subcategory[]>>({});


  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Hovered category object or null
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

  const [isUserHovered, setIsUserHovered] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const categoryRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [isSpecialtyHovered, setIsSpecialtyHovered] = useState(false);
  const [specialties, setSpecialties] = useState<Subcategory[]>([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(false);
  const [specialtiesFetched, setSpecialtiesFetched] = useState(false);

  

  useEffect(() => {
    // fetch categories from your API
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await fetch("/api/v2/category/categoryName");
        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.status}`);
        }
        const data: Category[] = await res.json();
        setCategories(data || []);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setCategories([]);
        setCategoriesError(err.message || "Unknown error");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

    const handleMouseEnter = (category: Category) => {
  setHoveredCategory(category);

  if (!subcategoryMap[category._id]) {
    fetch(`/api/v2/category/${category._id}/subcategories`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch subcategories");
        return res.json();
      })
      .then((data: Subcategory[]) => {
        console.log("Fetched subcategories:", data);
        setSubcategoryMap((prev) => ({
          ...prev,
          [category._id]: data,
          
        }));
      })
      .catch((err) => {
        console.error("Failed to fetch subcategories:", err);
        setSubcategoryMap((prev) => ({ ...prev, [category._id]: [] }));
      });
  }
};
  const handleSpecialtyMouseEnter = () => {
  setIsSpecialtyHovered(true);
  if (!specialtiesFetched) {
    setIsLoadingSpecialties(true);
    fetch("/api/v2/special-package")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch specialties");
        return res.json();
      })
      .then((data: Subcategory[]) => {
        console.log("my speciality")
        setSpecialties(data || []);
        setSpecialtiesFetched(true);
      })
      .catch((err) => {
        console.error("Error fetching specialties:", err);
        setSpecialties([]);
      })
      .finally(() => {
        setIsLoadingSpecialties(false);
      });
  }
};




  // Search effect
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSug(false);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v2/product/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          setSuggestions([]);
          setShowSug(false);
          return;
        }
        const data = await res.json();
        const products = data.products || data.items || data.results || [];
        setSuggestions(Array.isArray(products) ? products : []);
        setShowSug(Array.isArray(products) && products.length > 0);
      } catch (err) {
        console.error("Search error:", err);
        setSuggestions([]);
        setShowSug(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Close suggestion dropdown on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSug(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close category dropdown on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
        setHoveredCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  

  async function logoutHandler() {
    try {
      const url = seller ? "/api/v2/shop/logout" : "/api/v2/user/logout";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Something went wrong");
      removeUser();
      removeSeller();
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        const sel = suggestions[activeIdx];
        if ((sel as any)._id) {
          navigate(`/product/${(sel as any)._id}`);
        }
      } else if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
      setShowSug(false);
      setQuery("");
      setActiveIdx(-1);
    } else if (e.key === "Escape") {
      setShowSug(false);
      setActiveIdx(-1);
    }
  }

  function openCartHandler() {
    setIsCartOpen((prev) => !prev);
  }

  function openWishlistHandler() {
    setIsWishlistOpen((prev) => !prev);
  }

  return (
    <header className="w-full bg-white shadow-sm border-b font-inter">
      <div className="w-full max-w-screen-xl flex flex-col sm:flex-row items-center h-auto sm:h-20 px-4 sm:px-8 gap-2 sm:gap-0 mx-auto">
        {/* Logo */}
        <div className="flex items-center h-10 pr-4 flex-shrink-0">
          <Logo />
        </div>

        {/* Categories + Search */}
          <div className="flex flex-1 items-center h-full">
          {/* Category Button */}
          <div ref={categoryRef} className="relative flex items-center h-full">
            <button
              onClick={() => {
                setIsCategoryOpen((prev) => !prev);
                setHoveredCategory(null);
              }}
              className="flex items-center px-3 bg-[#f5f5f5] text-xs font-medium gap-1 border-r h-8 rounded-l-full hover:bg-gray-100 w-[60px] justify-between"
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            >
              All
              <IoIosArrowForward className="rotate-90 transition-transform duration-200" size={18} />
            </button>

           
          {isCategoryOpen && (
              <div
                className="absolute left-0 top-full mt-2 z-50 flex"
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Category List */}
                <div className="bg-white shadow-lg border w-60 max-h-[85vh] overflow-auto text-xs">
                  {isLoadingCategories ? (
                    <div className="p-4">Loading...</div>
                  ) : categoriesError ? (
                    <div className="p-4 text-red-600">{categoriesError}</div>
                  ) : (
                   <ul className="text-sm font-medium text-gray-800">
                    {categories.map((category) => (
                      <li
                        key={category._id}
                        className={`group flex justify-between items-center cursor-pointer px-4 py-3  hover:bg-gray-100 ${
                          hoveredCategory?._id === category._id ? "bg-gray-100" : ""
                        }`}
                        onMouseEnter={() => handleMouseEnter(category)}
                        onClick={() => {
                          setIsCategoryOpen(false);
                          navigate(
                            `/category/${category.name
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")}`
                          );
                        }}
                      >
                        <span>{category.name}</span>

                        {/* Always-visible arrow */}
                        <IoIosArrowForward
                          size={16}
                          className={`text-gray-500 transition-transform duration-200`}
                        />
                      </li>
                    ))}
                  </ul>

                  )}
                </div>

                {/* Subcategory Panel */}
               {hoveredCategory &&
                subcategoryMap[hoveredCategory._id] &&
                subcategoryMap[hoveredCategory._id].length > 0 && (
                  <div
                    className="bg-white shadow-lg border w-[280px] max-h-[80vh] overflow-auto p-2 text-sm"
                    onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                  >
                    {subcategoryMap[hoveredCategory._id].map((sub: Subcategory) => (
                      <div
                        key={sub._id}
                        className="text-gray-700 cursor-pointer p-2 hover:bg-gray-100"
                        onClick={() => {
                          navigate(`/get-products-by-subcategory/${sub._id}`);
                          setIsCategoryOpen(false);
                          setHoveredCategory(null);
                        }}
                      >
                        {sub.name}
                      </div>
                    ))}
                  </div>
              )}

              </div>
            )}
          </div>

          {/* Search input */}
          <div className="flex items-center h-full relative w-[350px] sm:w-[450px]" ref={containerRef}>
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="flex-1 px-4 text-sm outline-none bg-white text-[#1C647C] placeholder:text-xs placeholder-[#1C647C] h-8 border border-gray-200 rounded-none"
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIdx(-1);
              }}
              onKeyDown={handleSearchKeyDown}
            />
            <button
              className="flex items-center justify-center px-3 bg-[#006666] hover:bg-[#005555] h-8 rounded-r-full"
              onClick={() => {
                if (activeIdx >= 0 && suggestions[activeIdx]) {
                  const sel = suggestions[activeIdx];
                  if ((sel as any)._id) {
                    navigate(`/product/${(sel as any)._id}`);
                  }
                } else if (query.trim()) {
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                }
                setShowSug(false);
                setQuery("");
                setActiveIdx(-1);
              }}
            >
              <AiOutlineSearch size={28} color="white" />
            </button>

            {showSug && suggestions.length > 0 && (
              <ul
                className="absolute left-0 right-0 top-full mt-2 z-50 max-h-72 overflow-auto bg-white rounded-md shadow-lg border border-gray-200"
              >
                {suggestions.map((p, i) => {
                  const id = (p as any)._id;
                  const rawCategory = (p as any).category;
                  const categoryLabel =
                    typeof rawCategory === "string"
                      ? rawCategory
                      : rawCategory?.name || "";

                  const imgCandidate =
                    Array.isArray((p as any).images) && (p as any).images.length > 0
                      ? (p as any).images[0]
                      : Array.isArray((p as any).variants) && (p as any).variants.length > 0
                      ? (p as any).variants[0].thumbnail
                      : undefined;

                  const imgSrc = toImageUrl(imgCandidate);

                  return (
                    <li
                      key={id || `${(p as any).name}-${i}`}
                      onMouseDown={() => {
                        if (id) navigate(`/product/${id}`);
                        setShowSug(false);
                        setQuery("");
                        setActiveIdx(-1);
                      }}
                      className={`flex items-center gap-3 p-3 cursor-pointer ${
                        i === activeIdx ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <img
                        src={imgSrc}
                        alt={(p as any).name || "product"}
                        className="w-12 h-12 object-contain bg-gray-100 rounded"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
                        }}
                      />
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold text-gray-800 line-clamp-1">
                          {(p as any).name}
                        </span>
                        <span className="text-gray-500 text-xs">{categoryLabel}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side: user / cart / wishlist / etc */}
        <div className="flex flex-wrap sm:flex-nowrap items-center text-[11px] ml-0 sm:ml-2 gap-1 flex-shrink-0 justify-center sm:justify-start w-full sm:w-auto">
          {/* Specialty & Get Quote */}
          <div className="flex items-center gap-2 font-montserrat text-[#1C647C]">
            <div
              className="relative inline-block text-left"
              onMouseEnter={handleSpecialtyMouseEnter}
              onMouseLeave={() => setIsSpecialtyHovered(false)}

            >
              <Link to="/specialty" className="px-2 py-1 rounded-md flex items-center">
                <FaUserDoctor size={16} />
                <span> By Specialty</span>
              </Link>

{isSpecialtyHovered && (
  <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
    <ul className="py-1 text-sm">
      {isLoadingSpecialties ? (
        <li className="px-3 py-2 text-gray-500">Loading...</li>
      ) : specialties.length === 0 ? (
        <li className="px-3 py-2 text-red-500">No specialties found</li>
      ) : (
        specialties.map((specialty) => (
          <li key={specialty._id}>
            <Link
              to={`/specialty/${specialty.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsSpecialtyHovered(false)}
            >
              {specialty.name}
            </Link>
          </li>
        ))
      )}
    </ul>
  </div>
)}

            </div>

            <Link to="/get-quote" className="px-2 py-1 rounded-md transition flex items-center">
              <TbFileInvoice size={16} />
              <span> Get Quote</span>
            </Link>
          </div>

          {/* User / Profile Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsUserHovered(true)}
            onMouseLeave={() => setIsUserHovered(false)}
          >
            {user ? (
              <button className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors duration-200 ${isUserHovered ? "bg-[#1C647C] text-white" : "bg-white text-[#1C647C]"}`}>
                <FaRegCircleUser size={16} />
                <span>{user.firstName?.split(" ")[0] || "Profile"}</span>
                <IoIosArrowForward className={`transition-transform duration-200 ${isUserHovered ? "-rotate-90" : "rotate-90"}`} size={12} />
              </button>
            ) : (
              <Link to="/user" className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors duration-200 ${isUserHovered ? "bg-[#1C647C] text-white" : "bg-white text-[#1C647C]"}`}>
                <FaRegCircleUser size={16} />
                <span>Login</span>
                <IoIosArrowForward className={`transition-transform duration-200 ${isUserHovered ? "-rotate-90" : "rotate-90"}`} size={12} />
              </Link>
            )}

            {isUserHovered && (
              <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-gray-200 rounded shadow-md z-50 text-[11px] text-gray-800">
                {user ? (
                  <>
                    <Link to="/account" className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100">
                      <FaRegCircleUser size={14} />
                      <span>My Account</span>
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100">
                      <AiOutlineHeart size={14} />
                      <span>Wishlist</span>
                    </Link>
                    <Link to="/add-to-cart" className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100">
                      <AiOutlineShoppingCart size={14} />
                      <span>Cart</span>
                    </Link>
                    <Link to="/account/orders" className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100">
                      <RiShoppingBag4Line size={14} />
                      <span>My Orders</span>
                    </Link>
                    <hr className="my-1" />
                    <Link to="/support" className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100">
                      <MdOutlineSupportAgent size={14} />
                      <span>Support</span>
                    </Link>
                    <hr className="my-1" />
                    <button onClick={logoutHandler} className="flex items-center gap-2 px-3 py-1 w-full text-red-600 hover:bg-gray-100">
                      <FaSignOutAlt size={14} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center px-3 py-1">
                      <span>New customer?</span>
                      <Link to="/signup" className="text-blue-600 text-[10px]">
                        Sign Up
                      </Link>
                    </div>
                    <hr />
                    <Link to="/user" className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100">
                      <FaRegCircleUser size={14} />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/user/orders" className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100">
                      <RiShoppingBag4Line size={14} />
                      <span>Orders</span>
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100">
                      <AiOutlineHeart size={14} />
                      <span>Wishlist</span>
                    </Link>
                    <Link to="/rewards" className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100">
                      <IoGiftSharp size={14} />
                      <span>Rewards</span>
                    </Link>
                    <Link to="/gift-cards" className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100">
                      <BsCashStack size={14} />
                      <span>Gift Cards</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Become a Seller */}
          <Link to="/signup-seller" className="px-2 py-1 rounded-md text-[#1C647C]">
            Become a Seller
          </Link>

          {/* Wishlist button */}
          <button
            onClick={openWishlistHandler}
            aria-label="Open Wishlist"
            className="relative flex items-center px-2 py-1 cursor-pointer rounded-full text-[11px] text-[#1C647C] hover:bg-[#155d72] hover:text-white transition-colors duration-200"
          >
            <AiOutlineHeart size={16} />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#3bc177] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart button */}
          <button
            onClick={openCartHandler}
            aria-label="Open Cart"
            className="relative flex items-center px-2 py-1 cursor-pointer rounded-full text-[11px] text-[#1C647C] hover:bg-[#155d72] hover:text-white transition-colors duration-200"
          >
            <AiOutlineShoppingCart size={16} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#3bc177] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      {isCartOpen && <Cart cartOpenHandler={openCartHandler} />}
      {isWishlistOpen && <Wishlist wishlistOpenHandler={openWishlistHandler} />}
    </header>
  );
}
