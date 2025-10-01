// Header.tsx

import { Link, useNavigate } from "react-router-dom";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from "react-icons/ai";
// import { BsCashStack } from "react-icons/bs";
import { FaRegCircleUser, FaUserDoctor } from "react-icons/fa6";
import { TbFileInvoice } from "react-icons/tb";
import { RiShoppingBag4Line } from "react-icons/ri";
import { MdOutlineSupportAgent } from "react-icons/md";
// import { IoGiftSharp } from "react-icons/io5";
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

type PackageType = {
  _id: string;
  name: string;
  // ... other fields
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



  const [, setLoadingPackageTypes] = useState(false);

  const [specialtyPackageTypes, setSpecialtyPackageTypes] = useState<Record<string, PackageType[]>>({});
  const [, setLoadingSpecialtyId] = useState<string | null>(null);
  const [, setSelectedSpecialtyId] = useState<string | null>(null);
  const [isSpecialtyHovered, setIsSpecialtyHovered] = useState(false);
  const [specialties, setSpecialties] = useState<Subcategory[]>([]);
  const [isLoadingSpecialties] = useState(false);
  const [specialtiesFetched, setSpecialtiesFetched] = useState(false);
  const specialtyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredSpecialtyId, setHoveredSpecialtyId] = useState<string | null>(null);
  
  const clearSpecialtyTimeout = () => {
  if (specialtyTimeoutRef.current) {
    clearTimeout(specialtyTimeoutRef.current);
    specialtyTimeoutRef.current = null;
  }
};


  const [showSellerDialog, setShowSellerDialog] = useState(false);




  useEffect(() => {
    // fetch categories from your API
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await fetch("/api/v2/category/");
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
      setLoadingPackageTypes(true);
      fetch("/api/v2/special-package")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch specialties");
          return res.json();
        })
        .then((data: Subcategory[]) => {
          setSpecialties(data || []);
          setSpecialtiesFetched(true);
        })
        .catch((err) => {
          console.error("Error fetching specialties:", err);
          setSpecialties([]);
        })
        .finally(() => {
          setLoadingPackageTypes(false);
        });
    }
  };

  // Fetch package types for a specialty — extracted as a helper to avoid duplication
  const fetchPackageTypes = async (specialtyId: string) => {
    setLoadingSpecialtyId(specialtyId);
    try {
      const res = await fetch(`/api/v2/special-package/${specialtyId}/package-types`);
      if (!res.ok) throw new Error("Failed to fetch package types");
      const data: PackageType[] = await res.json();
      setSpecialtyPackageTypes((prev) => ({
        ...prev,
        [specialtyId]: data || [],
      }));
    } catch (err) {
      console.error("Error fetching package types:", err);
      setSpecialtyPackageTypes((prev) => ({
        ...prev,
        [specialtyId]: [],
      }));
    } finally {
      setLoadingSpecialtyId(null);
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
  <header className="w-full bg-white shadow-md border-b font-inter text-xl">
    <div className="w-full flex flex-col sm:flex-row items-center h-auto sm:h-28 px-6 sm:px-10 gap-6 sm:gap-4">
      {/* Logo */}
      <div className="flex items-center h-20 pr-8 flex-shrink-0">
        <div className="scale-125">
          <Logo />
        </div>
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
            className="flex items-center px-6 bg-[#f5f5f5] text-lg font-semibold gap-3 border-r h-14 rounded-l-full hover:bg-gray-100 min-w-[100px] justify-between"
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            All
            <IoIosArrowForward className="rotate-90 transition-transform duration-200" size={26} />
          </button>

          {isCategoryOpen && (
            <div
              className="absolute left-0 top-full mt-3 z-50 flex"
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Category List */}
              <div className="bg-white shadow-lg border w-80 max-h-[85vh] overflow-auto text-lg">
                {isLoadingCategories ? (
                  <div className="p-6">Loading...</div>
                ) : categoriesError ? (
                  <div className="p-6 text-red-600">{categoriesError}</div>
                ) : (
                  <ul className="text-lg font-medium text-gray-800">
                    {categories.map((category) => (
                      <li
                        key={category._id}
                        className={`group flex justify-between items-center cursor-pointer px-6 py-4 hover:bg-gray-100 ${
                          hoveredCategory?._id === category._id ? "bg-gray-100" : ""
                        }`}
                        onMouseEnter={() => handleMouseEnter(category)}
                       
                      >
                        <span>{category.name}</span>
                        <IoIosArrowForward size={22} className="text-gray-500" />
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
                    className="bg-white shadow-lg border w-[340px] max-h-[80vh] overflow-auto p-4 text-lg"
                    onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                  >
                    {subcategoryMap[hoveredCategory._id].map((sub: Subcategory) => (
                      <div
                        key={sub._id}
                        className="text-gray-700 cursor-pointer p-3 hover:bg-gray-100"
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
        <div className="flex items-center h-full relative flex-1 max-w-2xl" ref={containerRef}>
          <input
            type="text"
            placeholder="Search for products, brands and more"
            className="flex-1 px-6 text-lg outline-none bg-white text-[#1C647C] placeholder:text-lg placeholder-[#1C647C] h-14 border border-gray-200 rounded-none"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(-1);
            }}
            onKeyDown={handleSearchKeyDown}
          />
          <button
            className="flex items-center justify-center px-6 bg-[#006666] hover:bg-[#005555] h-14 rounded-r-full"
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
            <AiOutlineSearch size={34} color="white" />
          </button>

          {showSug && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-3 z-50 max-h-[420px] overflow-auto bg-white rounded-md shadow-lg border border-gray-200">
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
                    className={`flex items-center gap-5 p-5 cursor-pointer ${
                      i === activeIdx ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <img
                      src={imgSrc}
                      alt={(p as any).name || "product"}
                      className="w-16 h-16 object-contain bg-gray-100 rounded"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
                      }}
                    />
                    <div className="flex flex-col text-lg">
                      <span className="font-semibold text-gray-800 line-clamp-1">
                        {(p as any).name}
                      </span>
                      <span className="text-gray-500 text-sm">{categoryLabel}</span>
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
      <div className="flex items-center  font-montserrat text-[#1C647C]">
          <div className="relative inline-block text-left"
  onMouseEnter={() => {
    clearSpecialtyTimeout();
    handleSpecialtyMouseEnter();
  }}
  onMouseLeave={() => {
    specialtyTimeoutRef.current = setTimeout(() => {
      setIsSpecialtyHovered(false);
      setSelectedSpecialtyId(null);
      setHoveredSpecialtyId(null);
    }, 150);
  }}
>
  <Link to="/" className="px-5 py-3 rounded-md transition flex items-center text-lg">
    <FaUserDoctor size={16} />
    <span className="ml-1">By Specialty</span>
  </Link>

  {/* Dropdown Container - both panels */}
  {isSpecialtyHovered && (
    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 z-50"
      onMouseEnter={clearSpecialtyTimeout}
      onMouseLeave={() => {
        specialtyTimeoutRef.current = setTimeout(() => {
          setIsSpecialtyHovered(false);
          setHoveredSpecialtyId(null);
        }, 150);
      }}
    >
      <div className="flex bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-hidden">

        {/* Left Panel - Specialties */}
        <div className="w-[250px] max-w-[90vw] overflow-y-auto border-r border-gray-200">
          <ul className="py-1 text-sm">
            {isLoadingSpecialties ? (
              <li className="px-3 py-2 text-gray-500">Loading...</li>
            ) : specialties.length === 0 ? (
              <li className="px-3 py-2 text-red-500">No specialties found</li>
            ) : (
              specialties.map((specialty) => (
                <li
                  key={specialty._id}
                  className={`px-4 py-2 cursor-pointer ${
                    hoveredSpecialtyId === specialty._id
                      ? "bg-gray-100 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                  onMouseEnter={() => {
                    setHoveredSpecialtyId(String(specialty._id));
                    if (!specialtyPackageTypes[specialty._id]) {
                      fetchPackageTypes(specialty._id);
                    }
                  }}
                  onClick={() => {
                    navigate(
                      `/get-products-by-speciality-package/${String(specialty._id)
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")}`
                    );
                  }}
                >
                  <div className="flex items-center justify-between text-black">
                    <span>{specialty.name}</span>
                    <IoIosArrowForward className="text-gray-400 text-sm ml-2" />
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

  
       {/* Right Panel - Packages */}
{hoveredSpecialtyId &&
  specialtyPackageTypes[hoveredSpecialtyId] && (
    <div className="w-[250px] p-4 overflow-y-auto bg-gray-50">
      {specialtyPackageTypes[hoveredSpecialtyId].length === 0 ? (
        <p className="text-gray-500">No package types found for this specialty.</p>
      ) : (
        <ul>
          {specialtyPackageTypes[hoveredSpecialtyId].map((pkg) => (
            <li
              key={pkg._id}
              className="py-1 text-black hover:text-blue-600 cursor-pointer"
              onClick={() => {
                navigate(
                  `/get-products-by-speciality-package-type/${String(pkg._id)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")}`
                );
              }}
            >
              {pkg.name}
            </li>
          ))}
        </ul>
      )}
    </div>
)}


      </div>
    </div>
  )}
</div>

     


    
  


          <Link to="/get-quote" className="px-5 py-3 rounded-md transition flex items-center text-lg">
            <TbFileInvoice size={24} />
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
            <button
              className={`flex items-center gap-3 px-5 py-3 rounded-full transition-colors duration-200 text-lg ${
                isUserHovered ? "bg-[#1C647C] text-white" : "bg-white text-[#1C647C]"
              }`}
            >
              <FaRegCircleUser size={24} />
              <span>{user.firstName?.split(" ")[0] || "Profile"}</span>
              <IoIosArrowForward
                className={`transition-transform duration-200 ${
                  isUserHovered ? "-rotate-90" : "rotate-90"
                }`}
                size={18}
              />
            </button>
          ) : (
            <Link
              to="/user"
              className={`flex items-center gap-3 px-5 py-3 rounded-full transition-colors duration-200 text-lg ${
                isUserHovered ? "bg-[#1C647C] text-white" : "bg-white text-[#1C647C]"
              }`}
            >
              <FaRegCircleUser size={24} />
              <span>Login</span>
              <IoIosArrowForward
                className={`transition-transform duration-200 ${
                  isUserHovered ? "-rotate-90" : "rotate-90"
                }`}
                size={18}
              />
            </Link>
          )}

          {/* Dropdown */}
          {isUserHovered && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-white border border-gray-200 rounded shadow-md z-50 text-lg text-gray-800">
              {user ? (
                <>
                  <Link to="/account" className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100">
                    <FaRegCircleUser size={20} />
                    <span>My Account</span>
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100">
                    <AiOutlineHeart size={20} />
                    <span>Wishlist</span>
                  </Link>
                  <Link to="/add-to-cart" className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100">
                    <AiOutlineShoppingCart size={20} />
                    <span>Cart</span>
                  </Link>
                  <Link to="/account/orders" className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100">
                    <RiShoppingBag4Line size={20} />
                    <span>My Orders</span>
                  </Link>
                  <hr className="my-2" />
                  <Link to="/support" className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100">
                    <MdOutlineSupportAgent size={20} />
                    <span>Support</span>
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={logoutHandler}
                    className="flex items-center gap-4 px-5 py-3 w-full text-red-600 hover:bg-gray-100"
                  >
                    <FaSignOutAlt size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center px-5 py-3">
                    <span>New customer?</span>
                    <Link to="/signup" className="text-blue-600 text-base">
                      Sign Up
                    </Link>
                  </div>
                  <hr />
                  {/* <Link to="/user" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100">
                    <FaRegCircleUser size={20} />
                    <span>My Profile</span>
                  </Link>
                  <Link to="/user/orders" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100">
                    <RiShoppingBag4Line size={20} />
                    <span>Orders</span>
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100">
                    <AiOutlineHeart size={20} />
                    <span>Wishlist</span>
                  </Link>
                  <Link to="/rewards" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100">
                    <IoGiftSharp size={20} />
                    <span>Rewards</span>
                  </Link>
                  <Link to="/gift-cards" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100">
                    <BsCashStack size={20} />
                    <span>Gift Cards</span>
                  </Link> */}
                </>
              )}
            </div>
          )}
        </div>

        {/* Become a Seller */}
        {user ? (
          <button
            onClick={() => setShowSellerDialog(true)}
            className="px-5 py-3 rounded-md text-[#1C647C] text-lg"
          >
            Become a Seller
          </button>
        ) : (
          <Link to="/signup-seller" className="px-5 py-3 rounded-md text-[#1C647C] text-lg">
            Become a Seller
          </Link>
        )}

        {/* Wishlist button */}
        <button
          onClick={openWishlistHandler}
          aria-label="Open Wishlist"
          className="relative flex items-center px-5 py-3 cursor-pointer rounded-full text-lg text-[#1C647C] hover:bg-[#155d72] hover:text-white transition-colors duration-200"
        >
          <AiOutlineHeart size={26} />
          {wishlist.length > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#3bc177] text-white text-sm font-bold flex items-center justify-center ring-2 ring-white">
              {wishlist.length}
            </span>
          )}
        </button>

        {/* Cart button */}
        <button
          onClick={openCartHandler}
          aria-label="Open Cart"
          className="relative flex items-center px-5 py-3 cursor-pointer rounded-full text-lg text-[#1C647C] hover:bg-[#155d72] hover:text-white transition-colors duration-200"
        >
          <AiOutlineShoppingCart size={26} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#3bc177] text-white text-sm font-bold flex items-center justify-center ring-2 ring-white">
              {cart.length}
            </span>
          )}
        </button>
      </div>
    </div>

    {/* Modals */}
    {isCartOpen && <Cart cartOpenHandler={openCartHandler} />}
    {isWishlistOpen && <Wishlist wishlistOpenHandler={openWishlistHandler} />}

    {/* Seller Confirmation Dialog */}
    {showSellerDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-96 text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            You are leaving Customer Portal
          </h2>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={async () => {
                await logoutHandler();
                setShowSellerDialog(false);
                navigate("/signup-seller");
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
            <button
              onClick={() => setShowSellerDialog(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Keep me Logged in
            </button>
          </div>
        </div>
      </div>
    )}
  </header>
);




}