// src/components/Header.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { FaRegCircleUser, FaUserDoctor } from "react-icons/fa6";
import { TbFileInvoice } from "react-icons/tb";
import { RiShoppingBag4Line } from "react-icons/ri";
import { MdOutlineSupportAgent } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import { IoIosArrowForward, IoMdMenu, IoMdClose } from "react-icons/io";
import { Logo } from "../UIComponents/Logo";
import Wishlist from "./Wishlist";
import Cart from "./Cart";
import MedicopCart from "./MedicopCart";
import placeholderImg from "../../../public/image60.png";
import { Product } from "@/Types/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import { useSellerStore } from "@/store/sellerStore";
import { API_URL, BASE_URL } from "@/data";
import {
  MEDICOP_LIST_EVENT_NAME,
  getMedicopList,
} from "@/medicop/storage";

const PLACEHOLDER_IMG = placeholderImg;
function toImageUrl(value?: string | null) {
  if (!value) return PLACEHOLDER_IMG;
  const normalized = value.trim().replace(/^\/+/, "");
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
  if (normalized.startsWith("images/")) return `${BASE_URL}${normalized}`;
  return `${BASE_URL}images/${normalized}`;
}

function getSuggestionImageSrc(product: Product) {
  const variantFirst = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants[0] : undefined;
  const variantCandidate =
    variantFirst?.thumbnail ||
    (Array.isArray(variantFirst?.images) && variantFirst.images.length > 0 ? variantFirst.images[0] : undefined);
  if (variantCandidate) return toImageUrl(variantCandidate);

  const productCandidate =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : undefined;
  if (productCandidate) return toImageUrl(productCandidate);

  return PLACEHOLDER_IMG;
}

type Category = { _id: string; name: string };
type Subcategory = { _id: string; name: string };
type PackageType = { _id: string; name: string };

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Header() {
  // stores
  const cart = useCartStore((s: any) => s.cart) || [];
  const wishlist = useWishlistStore((s: any) => s.wishlist) || [];
  const { user, removeUser } = useUserStore((s: any) => s);
  const { seller, removeSeller } = useSellerStore((s: any) => s);
  const location = useLocation();
  const isMedicopRoute = location.pathname.startsWith("/medicop");

  // derive roles
  const isSeller = Boolean(seller);
  // Many apps store admin in the user store with role === "Admin"
  const isAdmin =
    Boolean(user) &&
    (String(user?.role || "").toLowerCase() === "admin" ||
      String(user?.role || "").toLowerCase() === "administrator");
  const isRealUser = Boolean(user) && !isAdmin;

  // core state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [subcategoryMap, setSubcategoryMap] = useState<
    Record<string, Subcategory[]>
  >({});
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(
    null,
  );

  // specialties
  const [specialties, setSpecialties] = useState<Subcategory[]>([]);
  const [specialtiesFetched, setSpecialtiesFetched] = useState(false);
  const [isSpecialtyHovered, setIsSpecialtyHovered] = useState(false);
  const [specialtyPackageTypes, setSpecialtyPackageTypes] = useState<
    Record<string, PackageType[]>
  >({});
  const [hoveredSpecialtyId, setHoveredSpecialtyId] = useState<string | null>(
    null,
  );
  const specialtyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [medicopListCount, setMedicopListCount] = useState(() => getMedicopList().length);
  // profile / user menu improvements
  const [isUserHovered, setIsUserHovered] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const [showSellerDialog, setShowSellerDialog] = useState(false);

  // search
  const queryParams = useQuery();
  const [query, setQuery] = useState(queryParams.get("q") || "");

  useEffect(() => {
    const q = queryParams.get("q") || "";
    setQuery(q);
  }, [location.search]);

  useEffect(() => {
    if (!isMedicopRoute) return;
    const syncMedicopCount = () => setMedicopListCount(getMedicopList().length);
    syncMedicopCount();
    window.addEventListener("storage", syncMedicopCount);
    window.addEventListener(MEDICOP_LIST_EVENT_NAME, syncMedicopCount);
    return () => {
      window.removeEventListener("storage", syncMedicopCount);
      window.removeEventListener(MEDICOP_LIST_EVENT_NAME, syncMedicopCount);
    };
  }, [isMedicopRoute]);

  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  // mobile UI
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [,setMobileSearchOpen] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [mobileSpecialties, setMobileSpecialties] = useState<Subcategory[]>([]);
  const [mobileSpecialtiesLoaded, setMobileSpecialtiesLoaded] = useState(false);
  const [expandedSpecialtyId, setExpandedSpecialtyId] = useState<string | null>(null);

  // refs + navigate
  const categoryRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // profile close timeout (fix for desktop hover gap)
  const profileCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearProfileCloseTimeout = () => {
    if (profileCloseTimeoutRef.current) {
      clearTimeout(profileCloseTimeoutRef.current);
      profileCloseTimeoutRef.current = null;
    }
  };

  const handleProfileMouseEnter = () => {
    clearProfileCloseTimeout();
    setIsUserHovered(true);
  };

  const handleProfileMouseLeave = () => {
    clearProfileCloseTimeout();
    // small delay to avoid closing when moving mouse through a tiny gap
    profileCloseTimeoutRef.current = setTimeout(() => {
      setIsUserHovered(false);
    }, 160); // adjust between 120-200ms if needed
  };

  useEffect(() => {
    return () => {
      // cleanup any lingering timeouts on unmount
      if (profileCloseTimeoutRef.current) {
        clearTimeout(profileCloseTimeoutRef.current);
        profileCloseTimeoutRef.current = null;
      }
      if (specialtyTimeoutRef.current) {
        clearTimeout(specialtyTimeoutRef.current);
        specialtyTimeoutRef.current = null;
      }
    };
  }, []);

  // simple fetch categories on mount
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await fetch(API_URL+"category/");
        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
        const data = await res.json();
        if (mounted) setCategories(data || []);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        if (mounted) {
          setCategories([]);
          setCategoriesError(err.message || "Unknown error");
        }
      } finally {
        if (mounted) setIsLoadingCategories(false);
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // fetch subcategories on hover / open
  const handleMouseEnter = (category: Category) => {
    setHoveredCategory(category);
    if (!subcategoryMap[category._id]) {
      fetch(`${API_URL}category/${category._id}/subcategories`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch subcategories");
          return res.json();
        })
        .then((data: Subcategory[]) => {
          setSubcategoryMap((prev) => ({ ...prev, [category._id]: data || [] }));
        })
        .catch((err) => {
          console.error("Failed to fetch subcategories:", err);
          setSubcategoryMap((prev) => ({ ...prev, [category._id]: [] }));
        });
    }
  };

  // specialties fetch
  const handleSpecialtyMouseEnter = () => {
    setIsSpecialtyHovered(true);
    if (!specialtiesFetched) {
      fetch(API_URL+"special-package")
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
        });
    }
  };

  const fetchPackageTypes = async (specialtyId: string) => {
    try {
      const res = await fetch(
          `${API_URL}special-package/${specialtyId}/package-types`,
      );
      if (!res.ok) throw new Error("Failed to fetch package types");
      const data = await res.json();
      setSpecialtyPackageTypes((prev) => ({ ...prev, [specialtyId]: data || [] }));
    } catch (err) {
      console.error("Error fetching package types:", err);
      setSpecialtyPackageTypes((prev) => ({ ...prev, [specialtyId]: [] }));
    }
  };

  // search effect with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSug(false);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}product/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          setSuggestions([]);
          setShowSug(false);
          return;
        }
        const data = await res.json();
        const products = data.products || data.items || data.results || [];
        const normalizedProducts = Array.isArray(products) ? products.slice(0, 8) : [];
        setSuggestions(normalizedProducts);
        setShowSug(normalizedProducts.length > 0);
      } catch (err) {
        console.error("Search error:", err);
        setSuggestions([]);
        setShowSug(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // close suggestion dropdown on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSug(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        // mobile menu closes via its close button
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile profile popover when clicking outside it
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setMobileProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  // keyboard handlers for search
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
        if ((sel as any)._id) navigate(`/product/${(sel as any)._id}`);
      } else if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }else {
      navigate(`/`); // navigate to search page even if blank
    }
      setShowSug(false);
      // setQuery("");
      setActiveIdx(-1);
      setMobileSearchOpen(false);
    } else if (e.key === "Escape") {
      setShowSug(false);
      setActiveIdx(-1);
      setMobileSearchOpen(false);
    }
  }

  async function logoutHandler() {
    try {
      // keep existing behavior: sellers call shop logout, others call user logout
      const url = API_URL+ ( isSeller ? "shop/logout" : "user/logout")
      const res = await fetch(url);
      if (!res.ok) throw new Error("Something went wrong");

      removeUser();
      removeSeller();

      // close menus
      setIsUserHovered(false);
      setMobileProfileOpen(false);

      // ✅ navigate to homepage after logout
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  // specialty timeout helpers (for hover menus)
  const clearSpecialtyTimeout = () => {
    if (specialtyTimeoutRef.current) {
      clearTimeout(specialtyTimeoutRef.current);
      specialtyTimeoutRef.current = null;
    }
  };

  // function labelFromMaybeObject(v?: any) {
  //   if (!v) return "";
  //   return typeof v === "string" ? v : v?.name ?? "";
  // }

  // open/close cart/wishlist
  const openCartHandler = () => setIsCartOpen((p) => !p);
  const openWishlistHandler = () => setIsWishlistOpen((p) => !p);

  // helper to go to account and close popovers
  const goToAccount = () => {
    setMobileProfileOpen(false);
    setIsUserHovered(false);
    navigate("/account");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b text-sm">
        <div className="max-w-[1400px] mx-auto w-full px-3 sm:px-6">
          <div className="flex items-center gap-3 py-3 md:py-2">
            {/* Left: mobile hamburger (sm hidden) & logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-md hover:bg-gray-100"
                aria-label="Open menu"
                onClick={() => {
                  setMobileMenuOpen(true);
                  if (!mobileSpecialtiesLoaded) {
                    fetch(API_URL + "special-package")
                      .then((res) => res.json())
                      .then((data: Subcategory[]) => {
                        setMobileSpecialties(data || []);
                        setMobileSpecialtiesLoaded(true);
                      })
                      .catch(() => {
                        setMobileSpecialties([]);
                        setMobileSpecialtiesLoaded(true);
                      });
                  }
                }}
              >
                <IoMdMenu size={22} />
              </button>

              <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}> 
                <Logo />
              </div>
            </div>

            {/* Categories + Search (responsive) */}
            <div className="flex-1 flex items-center gap-3">
              {/* Categories button (hidden on xs) */}
              <div ref={categoryRef} className="hidden md:flex relative items-center h-10">
                <button
                  onClick={() => {
                    setIsCategoryOpen((p) => !p);
                    setHoveredCategory(null);
                  }}
                  className="flex items-center px-3 bg-[#f5f5f5] text-sm font-medium gap-2 border-r h-10 rounded-l-full hover:bg-gray-100 min-w-[90px] justify-between"
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                >
                  <span>All</span>
                  <IoIosArrowForward className="rotate-90 transition-transform duration-200" size={16} />
                </button>

                {isCategoryOpen && (
                  <div className="absolute left-0 top-full mt-2 z-50 flex">
                    <div className="bg-white shadow-lg border w-64 max-h-[70vh] overflow-auto text-sm">
                      {isLoadingCategories ? (
                        <div className="p-4">Loading...</div>
                      ) : categoriesError ? (
                        <div className="p-4 text-red-600">{categoriesError}</div>
                      ) : (
                        <ul className="text-sm font-medium text-gray-800">
                          {categories.map((category) => (
                            <li
                              key={category._id}
                              className={`group flex justify-between items-center cursor-pointer px-4 py-3 hover:bg-gray-100 ${hoveredCategory?._id === category._id ? "bg-gray-100" : ""}`}
                              onMouseEnter={() => handleMouseEnter(category)}
                              onClick={() => {
                                navigate(`/get-products-by-category/${category._id}`);
                                setIsCategoryOpen(false);
                                setHoveredCategory(null);
                              }}
                            >
                              <span>{category.name}</span>
                              <IoIosArrowForward size={18} className="text-gray-500" />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Subcategory panel */}
                    {hoveredCategory &&
                      subcategoryMap[hoveredCategory._id] &&
                      subcategoryMap[hoveredCategory._id].length > 0 && (
                        <div className="bg-white shadow-lg border w-72 max-h-[70vh] overflow-auto p-3 text-sm">
                          {subcategoryMap[hoveredCategory._id].map((sub) => (
                            <div
                              key={sub._id}
                              className="text-gray-700 cursor-pointer py-2 px-2 hover:bg-gray-100"
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

              {/* Search bar: compact on md+, full icon on mobile */}
              <div className="flex items-center w-full">
                

                {/* desktop search */}
                <div
                  className="hidden md:flex items-center h-10 relative flex-1 max-w-2xl"
                  ref={containerRef}
                >
                  <input
                    type="text"
                    placeholder="Search for products, brands and more"
                    className="flex-1 px-3 text-sm outline-none bg-white text-[#1C647C] placeholder:text-sm placeholder-[#1C647C] h-10 border border-gray-200 rounded-l-full"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActiveIdx(-1);
                    }}
                    onKeyDown={handleSearchKeyDown}
                  />
                  <button
                    className="flex items-center justify-center px-3 bg-[#006666] hover:bg-[#005555] h-10 rounded-r-full"
                    onClick={() => {
                      if (activeIdx >= 0 && suggestions[activeIdx]) {
                        const sel = suggestions[activeIdx];
                        if ((sel as any)._id) navigate(`/product/${(sel as any)._id}`);
                      } else if (query.trim()) {
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                      }
                      setShowSug(false);
                      // setQuery("");
                      setActiveIdx(-1);
                    }}
                    aria-label="Search"
                  >
                    <AiOutlineSearch size={18} color="white" />
                  </button>

                  {showSug && suggestions.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full mt-2 z-50 max-h-80 overflow-auto bg-white rounded-md shadow-lg border border-gray-200 text-sm">
                      {suggestions.map((p, i) => {
                        const id = (p as any)._id;
                        const rawCategory = (p as any).category;
                        const categoryLabel = Array.isArray(rawCategory)
                          ? rawCategory
                              .map((item) =>
                                typeof item === "string" ? item : item?.name || "",
                              )
                              .filter(Boolean)
                              .join(", ")
                          : typeof rawCategory === "string"
                            ? rawCategory
                            : rawCategory?.name || (p as any).productType || "";
                        const imgSrc = getSuggestionImageSrc(p);
                        return (
                          <li
                            key={id || `${(p as any).name}-${i}`}
                            onMouseDown={() => {
                              if (id) navigate(`/product/${id}`);
                              setShowSug(false);
                              setQuery("");
                              setActiveIdx(-1);
                            }}
                            className={`flex items-center gap-3 p-3 cursor-pointer ${i === activeIdx ? "bg-gray-100" : "hover:bg-gray-50"}`}
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
                              <span className="font-medium text-gray-800 line-clamp-1">{(p as any).name}</span>
                              <span className="text-gray-500 text-xs">{categoryLabel}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: desktop & mobile icons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* By Specialty & Get Quote (hide on small) */}
              <div className="hidden lg:flex items-center gap-2">
                <div
                  className="relative inline-block"
                  onMouseEnter={() => {
                    clearSpecialtyTimeout();
                    handleSpecialtyMouseEnter();
                  }}
                  onMouseLeave={() => {
                    specialtyTimeoutRef.current = setTimeout(() => {
                      setIsSpecialtyHovered(false);
                      setHoveredSpecialtyId(null);
                    }, 150);
                  }}
                >
                  <Link to="/" className="px-3 py-2 rounded-md transition flex items-center text-sm text-[#1C647C]">
                    <FaUserDoctor size={14} />
                    <span className="ml-1">By Specialty</span>
                  </Link>

                  {isSpecialtyHovered && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 z-50">
                      <div className="flex bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-hidden text-sm">
                        <div className="w-[220px] max-w-[90vw] overflow-y-auto border-r border-gray-200">
                          <ul className="py-1">
                            {specialties.length === 0 ? (
                              <li className="px-3 py-2 text-gray-500">No specialties</li>
                            ) : (
                              specialties.map((s) => (
                                <li
                                  key={s._id}
                                  className={`px-3 py-2 cursor-pointer ${hoveredSpecialtyId === s._id ? "bg-gray-100 font-semibold" : "hover:bg-gray-100"}`}
                                  onMouseEnter={() => {
                                    setHoveredSpecialtyId(s._id);
                                    if (!specialtyPackageTypes[s._id]) fetchPackageTypes(s._id);
                                  }}
                                  onClick={() =>
                                    navigate(
                                      isMedicopRoute
                                        ? `/medicop/products?speciality=${encodeURIComponent(s.name)}`
                                        : `/get-products-by-speciality-package/${String(s._id)
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]+/g, "-")}`
                                    )
                                  }
                                >
                                  <div className="flex items-center justify-between text-black">
                                    <span>{s.name}</span>
                                    <IoIosArrowForward className="text-gray-400 text-sm ml-2" />
                                  </div>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>

                        {hoveredSpecialtyId && specialtyPackageTypes[hoveredSpecialtyId] && (
                          <div className="w-[220px] p-3 overflow-y-auto bg-gray-50">
                            {specialtyPackageTypes[hoveredSpecialtyId].length === 0 ? (
                              <p className="text-gray-500 text-sm">No package types</p>
                            ) : (
                              <ul>
                                {specialtyPackageTypes[hoveredSpecialtyId].map((pkg) => (
                                  <li
                                    key={pkg._id}
                                    className="py-1 text-black hover:text-blue-600 cursor-pointer text-sm"
                                    onClick={() =>
                                      navigate(
                                        isMedicopRoute
                                          ? `/medicop/products?speciality=${encodeURIComponent(
                                              specialties.find(
                                                (item) => item._id === hoveredSpecialtyId
                                              )?.name || "Speciality"
                                            )}&packageType=${encodeURIComponent(pkg.name)}`
                                          : `/get-products-by-speciality-package-type/${String(
                                              pkg._id
                                            )
                                              .toLowerCase()
                                              .replace(/[^a-z0-9]+/g, "-")}`
                                      )
                                    }
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

                <Link to="/get-quote" className="px-3 py-2 rounded-md transition flex items-center text-sm text-[#1C647C]">
                  <TbFileInvoice size={18} />
                  <span className="ml-1">Get Quote</span>
                </Link>
              </div>

              {/* Profile (condensed on small) */}
              <div
                ref={profileRef}
                className="relative"
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
                onFocus={() => {
                  clearProfileCloseTimeout();
                  setIsUserHovered(true);
                }}
                onBlur={(e) => {
                  // ensure blur actually moved focus outside whole profile container
                  const related = (e as React.FocusEvent).relatedTarget as Node | null;
                  if (!related || !profileRef.current?.contains(related)) {
                    clearProfileCloseTimeout();
                    profileCloseTimeoutRef.current = setTimeout(() => setIsUserHovered(false), 80);
                  }
                }}
                tabIndex={-1}
              >
                <div className="flex items-center">
                  {user || seller ? (
                    <button
                      className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 text-sm ${
                        isUserHovered ? "bg-[#1C647C] text-white" : "bg-white text-[#1C647C]"
                      }`}
                      aria-haspopup="true"
                      aria-expanded={isUserHovered || mobileProfileOpen}
                      onClick={() => {
                        setIsUserHovered((p) => !p);
                        setMobileProfileOpen(false);
                      }}
                    >
                      <FaRegCircleUser size={18} />
                      <span>
                        {user?.firstName?.split(" ")[0] ||
                          seller?.firstName?.split(" ")[0] ||
                          (isAdmin ? "Admin" : "Profile")}
                      </span>
                    </button>
                  ) : (
                    <Link
                      to="/user"
                      className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 text-sm ${
                        isUserHovered ? "bg-[#1C647C] text-white" : "bg-white text-[#1C647C]"
                      }`}
                    >
                      <FaRegCircleUser size={18} />
                      <span>Login</span>
                    </Link>
                  )}

                  {/* mobile small icon: tap to open profile menu if logged in, otherwise go to /user */}
                  <button
                    className="sm:hidden p-2 rounded-md hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (user || seller) {
                        setMobileProfileOpen((p) => !p);
                        setIsUserHovered(false);
                      } else {
                        navigate("/user");
                      }
                    }}
                    aria-label="Open profile"
                  >
                    <FaRegCircleUser size={20} />
                  </button>
                </div>

                {(isUserHovered || mobileProfileOpen) && (
                  <div
                    className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-md z-50 text-sm"
                    onMouseEnter={clearProfileCloseTimeout}
                    onMouseLeave={handleProfileMouseLeave}
                  >
                    {/* If logged in as seller OR admin -> limited menu (same options) */}
                    {(isSeller || isAdmin) ? (
                      <>
                        {/* Explicitly navigate to /account so seller lands on account (not seller dashboard) */}
                        {/* <button
                          onClick={() => goToAccount()}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
                        >
                          <FaRegCircleUser size={16} />
                          <span>My Account</span>
                        </button> */}

                        <Link
                          onClick={() => {
                            setMobileProfileOpen(false);
                            setIsUserHovered(false);
                          }}
                          to={isSeller ? "/seller" : "/admin"}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                        >
                          <RiShoppingBag4Line size={16} />
                          <span>Go to Dashboard</span>
                        </Link>

                        <Link
                          onClick={() => {
                            setMobileProfileOpen(false);
                            setIsUserHovered(false);
                          }}
                          to={isSeller ? "/seller/support" : "/admin/support"}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                        >
                          <MdOutlineSupportAgent size={16} />
                          <span>Support</span>
                        </Link>

                        <hr className="my-1" />

                        <button
                          onClick={async () => {
                            await logoutHandler();
                            setMobileProfileOpen(false);
                            setIsUserHovered(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2 w-full text-red-600 hover:bg-gray-100 text-sm"
                        >
                          <FaSignOutAlt size={16} />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : user ? (
                      // Regular user menu (full)
                      <>
                        {/* My Account - always visible (explicit navigation to ensure proper closing) */}
                        <button
                          onClick={() => goToAccount()}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
                        >
                          <FaRegCircleUser size={16} />
                          <span>My Account</span>
                        </button>

                        <Link
                          onClick={() => {
                            setMobileProfileOpen(false);
                            setIsUserHovered(false);
                          }}
                          to="/account/wishlist"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                        >
                          <AiOutlineHeart size={16} />
                          <span>Wishlist</span>
                        </Link>

                        <Link
                          onClick={() => {
                            setMobileProfileOpen(false);
                            setIsUserHovered(false);
                          }}
                          to="/add-to-cart"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                        >
                          <AiOutlineShoppingCart size={16} />
                          <span>Cart</span>
                        </Link>

                        <Link
                          onClick={() => {
                            setMobileProfileOpen(false);
                            setIsUserHovered(false);
                          }}
                          to="/account/orders"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                        >
                          <RiShoppingBag4Line size={16} />
                          <span>My Orders</span>
                        </Link>

                        <hr className="my-1" />

                        <Link
                          onClick={() => {
                            setMobileProfileOpen(false);
                            setIsUserHovered(false);
                          }}
                          to="/account/support"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                        >
                          <MdOutlineSupportAgent size={16} />
                          <span>Support</span>
                        </Link>

                        <Link
                          onClick={() => {
                            setMobileProfileOpen(false);
                            setIsUserHovered(false);
                          }}
                          to="/notification"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                        >
                          <MdOutlineSupportAgent size={16} />
                          <span>My Notification</span>
                        </Link>

                        <hr className="my-1" />

                        <button
                          onClick={async () => {
                            await logoutHandler();
                            setMobileProfileOpen(false);
                            setIsUserHovered(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2 w-full text-red-600 hover:bg-gray-100 text-sm"
                        >
                          <FaSignOutAlt size={16} />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <div className="px-4 py-2">
                        <div className="flex justify-between items-center">
                          <span>New customer?</span>
                          <Link
                            onClick={() => {
                              setMobileProfileOpen(false);
                            }}
                            to="/signup"
                            className="text-blue-600 text-sm"
                          >
                            Sign Up
                          </Link>
                        </div>
                        <hr className="mt-2" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Become seller - hide on xs */}
              {!seller && !isAdmin && (
                <>
                  {/* Become a Seller */}
                  <div className="hidden sm:block">
                    {user ? (
                      <button
                        onClick={() => setShowSellerDialog(true)}
                        className="px-3 py-2 rounded-md text-[#1C647C] text-sm"
                      >
                        Become a Seller
                      </button>
                    ) : (
                      <Link to="/signup-seller" className="px-3 py-2 rounded-md text-[#1C647C] text-sm">
                        Become a Seller
                      </Link>
                    )}
                  </div>
                </>
              )}

              {/* Wishlist & Cart (only for regular users) */}
              {(isRealUser || isMedicopRoute) && (
                <>
                  {!isMedicopRoute && (
                    <button onClick={openWishlistHandler} aria-label="Open Wishlist" className="relative p-2 rounded-full hover:bg-gray-100">
                      <AiOutlineHeart size={20} />
                      {wishlist.length > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#3bc177] text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                          {wishlist.length}
                        </span>
                      )}
                    </button>
                  )}

                  <button onClick={openCartHandler} aria-label="Open Cart" className="relative p-2 rounded-full hover:bg-gray-100">
                    <AiOutlineShoppingCart size={20} />
                    {(isMedicopRoute ? medicopListCount : cart.length) > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#3bc177] text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                        {isMedicopRoute ? medicopListCount : cart.length}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* mobile search overlay */}
        <div className="md:hidden bg-white border-t">
          <div className="max-w-[1100px] mx-auto px-4 py-3">
            <div className="flex items-center h-10 relative" ref={containerRef}>
              <input
                autoFocus={false}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="flex-1 px-3 text-sm outline-none bg-white text-[#1C647C] placeholder:text-sm placeholder-[#1C647C] h-10 border border-gray-200 rounded-l-full"
                placeholder="Search for products, brands and more"
              />
              <button onClick={() => {
                if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
                setMobileSearchOpen(false);
                setQuery("");
              }} className="flex items-center justify-center px-3 bg-[#006666] hover:bg-[#005555] h-10 rounded-r-full text-white">
                <AiOutlineSearch size={18} />
              </button>

              {showSug && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-2 z-50 max-h-80 overflow-auto bg-white rounded-md shadow-lg border border-gray-200 text-sm">
                  {suggestions.map((p, i) => {
                    const id = (p as any)._id;
                    const rawCategory = (p as any).category;
                    const categoryLabel = typeof rawCategory === "string" ? rawCategory : rawCategory?.name || "";
                    const imgSrc = getSuggestionImageSrc(p);
                    return (
                      <li
                        key={id || `${(p as any).name}-${i}`}
                        onMouseDown={() => {
                          if (id) navigate(`/product/${id}`);
                          setShowSug(false);
                          setQuery("");
                          setActiveIdx(-1);
                        }}
                        className={`flex items-center gap-3 p-3 cursor-pointer ${i === activeIdx ? "bg-gray-100" : "hover:bg-gray-50"}`}
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
                          <span className="font-medium text-gray-800 line-clamp-1">{(p as any).name}</span>
                          <span className="text-gray-500 text-xs">{categoryLabel}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* mobile menu slide-over */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 flex">
            <div ref={mobileMenuRef} className="w-80 max-w-full bg-white h-full shadow-xl p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <div onClick={() => { navigate("/"); setMobileMenuOpen(false); }} className="cursor-pointer"><Logo /></div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-md hover:bg-gray-100"><IoMdClose size={22} /></button>
              </div>

              <div className="space-y-3">
                <div className="border-b pb-3">
                  <div className="font-semibold mb-2">Categories</div>
                  {isLoadingCategories ? <div>Loading...</div> : categories.length === 0 ? <div className="text-sm text-gray-500">No categories</div> : (
                    <ul className="space-y-1">
                      {categories.map((c) => (
                        <li key={c._id}>
                          <div className="flex items-center justify-between">
                            <button
                              className="flex-1 text-left px-2 py-2 rounded hover:bg-gray-50"
                              onClick={() => {
                                navigate(`/get-products-by-category/${c._id}`);
                                setMobileMenuOpen(false);
                              }}
                            >
                              {c.name}
                            </button>
                            <button
                              className="px-2 py-2 text-gray-400"
                              onClick={() => {
                                if (expandedCategoryId === c._id) {
                                  setExpandedCategoryId(null);
                                } else {
                                  setExpandedCategoryId(c._id);
                                  if (!subcategoryMap[c._id]) {
                                    fetch(`${API_URL}category/${c._id}/subcategories`)
                                      .then((res) => res.json())
                                      .then((data: Subcategory[]) => {
                                        setSubcategoryMap((prev) => ({ ...prev, [c._id]: data || [] }));
                                      })
                                      .catch(() => {
                                        setSubcategoryMap((prev) => ({ ...prev, [c._id]: [] }));
                                      });
                                  }
                                }
                              }}
                            >
                              <IoIosArrowForward className={`transition-transform duration-200 ${expandedCategoryId === c._id ? "rotate-90" : ""}`} size={14} />
                            </button>
                          </div>
                          {expandedCategoryId === c._id && subcategoryMap[c._id] && subcategoryMap[c._id].length > 0 && (
                            <ul className="ml-4 border-l border-gray-200 space-y-1 py-1">
                              {subcategoryMap[c._id].map((sub) => (
                                <li key={sub._id}>
                                  <button
                                    className="w-full text-left px-2 py-1.5 text-sm text-gray-600 rounded hover:bg-gray-50 hover:text-[#16A34A]"
                                    onClick={() => {
                                      navigate(`/get-products-by-subcategory/${sub._id}`);
                                      setMobileMenuOpen(false);
                                    }}
                                  >
                                    {sub.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-b pb-3">
                  <div className="font-semibold mb-2">By Specialty</div>
                  {mobileSpecialtiesLoaded ? (
                    mobileSpecialties.length === 0 ? (
                      <div className="text-sm text-gray-500 px-2 py-2">No specialties</div>
                    ) : (
                      <ul className="space-y-1">
                        {mobileSpecialties.map((s) => (
                          <li key={s._id}>
                            <div className="flex items-center justify-between">
                              <button
                                className="flex-1 text-left px-2 py-2 rounded hover:bg-gray-50"
                                onClick={() => {
                                  navigate(`/get-products-by-speciality-package/${String(s._id).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
                                  setMobileMenuOpen(false);
                                }}
                              >
                                {s.name}
                              </button>
                              <button
                                className="px-2 py-2 text-gray-400"
                                onClick={() => {
                                  if (expandedSpecialtyId === s._id) {
                                    setExpandedSpecialtyId(null);
                                  } else {
                                    setExpandedSpecialtyId(s._id);
                                    if (!specialtyPackageTypes[s._id]) {
                                      fetchPackageTypes(s._id);
                                    }
                                  }
                                }}
                              >
                                <IoIosArrowForward className={`transition-transform duration-200 ${expandedSpecialtyId === s._id ? "rotate-90" : ""}`} size={14} />
                              </button>
                            </div>
                            {expandedSpecialtyId === s._id && specialtyPackageTypes[s._id] && specialtyPackageTypes[s._id].length > 0 && (
                              <ul className="ml-4 border-l border-gray-200 space-y-1 py-1">
                                {specialtyPackageTypes[s._id].map((pkg) => (
                                  <li key={pkg._id}>
                                    <button
                                      className="w-full text-left px-2 py-1.5 text-sm text-gray-600 rounded hover:bg-gray-50 hover:text-blue-600"
                                      onClick={() => {
                                        navigate(`/get-products-by-speciality-package-type/${String(pkg._id).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
                                        setMobileMenuOpen(false);
                                      }}
                                    >
                                      {pkg.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )
                  ) : (
                    <div className="text-sm text-gray-400 px-2 py-2">Loading specialties...</div>
                  )}
                </div>

                <div className="border-b pb-3">
                  <div className="font-semibold mb-2">Quick Links</div>
                  <ul className="space-y-1">
                    <li><Link onClick={() => setMobileMenuOpen(false)} to="/get-quote" className="block px-2 py-2 rounded hover:bg-gray-50">Get Quote</Link></li>
                    <li><Link onClick={() => setMobileMenuOpen(false)} to="/signup-seller" className="block px-2 py-2 rounded hover:bg-gray-50">Become a Seller</Link></li>
                    <li><Link onClick={() => setMobileMenuOpen(false)} to="/account/orders" className="block px-2 py-2 rounded hover:bg-gray-50">My Orders</Link></li>
                  </ul>
                </div>

                <div className="border-b pb-3">
                  <div className="font-semibold mb-2">Account</div>
                  {(isSeller || isAdmin || isRealUser) ? (
                    <div className="space-y-1">
                      <button onClick={() => { setMobileMenuOpen(false); goToAccount(); }} className="block px-2 py-2 rounded hover:bg-gray-50 text-left w-full">My Account</button>
                      {/* Go to dashboard for seller/admin */}
                      {(isSeller || isAdmin) && (
                        <Link onClick={() => setMobileMenuOpen(false)} to={isSeller ? "/seller" : "/admin"} className="block px-2 py-2 rounded hover:bg-gray-50">Go to Dashboard</Link>
                      )}
                      <button onClick={async () => { await logoutHandler(); setMobileMenuOpen(false); }} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50 text-red-600">Logout</button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Link onClick={() => setMobileMenuOpen(false)} to="/user" className="block px-2 py-2 rounded hover:bg-gray-50">Login / Signup</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Modals */}
        {isCartOpen &&
          (isMedicopRoute ? (
            <MedicopCart cartOpenHandler={openCartHandler} />
          ) : (
            <Cart cartOpenHandler={openCartHandler} />
          ))}
        {isWishlistOpen && <Wishlist wishlistOpenHandler={openWishlistHandler} />}

        {/* Seller Confirmation Dialog */}
        {showSellerDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">You are leaving Customer Portal</h2>
              <div className="flex justify-center gap-3 mt-4">
                <button onClick={async () => { await logoutHandler(); setShowSellerDialog(false); navigate("/signup-seller"); }} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Logout</button>
                <button onClick={() => setShowSellerDialog(false)} className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">Keep me Logged in</button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
