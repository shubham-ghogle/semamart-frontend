import { Link, useNavigate } from "react-router-dom";
// import { ActionBtn, SecondryBtn } from "../UI/Buttons";
import {
  AiOutlineHeart,
  // AiOutlineHeart,
  // AiOutlineShoppingCart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineUser,
  // AiOutlineHome,
  // AiOutlineUser,
} from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import { Logo } from "../UI/Logo";
// import { useUserStore } from "../../store/userStore";
// import { useSellerStore } from "../../store/sellerStore";
// import { useCartStore } from "../../store/cartStore";
// import { useWishlistStore } from "../../store/wishlistStore";
import placeholderImg from "../../../public/image60.png";
 import Wishlist from "./Wishlist";
 import Cart from "./Cart";
import { useState, useRef, useEffect } from "react";
import { Product } from "@/Types/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import { useSellerStore } from "@/store/sellerStore";


//const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

const categories = [
  "Consumables",
  "Instruments",
  "Medical Equipment",
  "Advanced & Robotic Systems",
  "Diagnostics",
  "Hospital Furniture",
  "Pharmaceuticals & Therapeutics",
  "Hospital IT & Software",
  "Kits & Bundles",
  "Facility & Utilities",
  "Specialty Packages",
];

const consumablesSubcategories = [
  "Surgical & Examination Gloves",
  "Syringes & Needles",
  "IV Sets & Infusion Supplies",
  "Catheters & Tubes",
  "Drapes, Sheets & Underpads",
  "Wound Care & Dressings",
  "Respiratory Consumables",
  "Infection Control & Cleaning",
  "Diagnostic Consumables",
  "General Use Disposables",
  "Masks & Personal Protective Equipment (PPE)",
];

const instrumentsSubcategories = [
  "General Surgical Instruments",
  "ENT Instruments",
  "Orthopaedic Instruments",
  "Ophthalmic Instruments",
  "Dental Instruments",
  "Diagnostic Instruments",
  "Minor OT / OPD Sets",
  "Paediatric & Neonatal Instruments",
  "Gynaecology & Obstetrics Instruments",
];
const medicalEquipmentSubcategories = [
  "Patient Monitoring Equipment",
  "ICU & Emergency Equipment",
  "Operation Theatre Equipment",
  "Diagnostic Imaging Equipment",
  "Anesthesia & Airway Equipment",
  "Surgical Equipment",
  "Sterilization & Disinfection Equipment",
  "Hospital Utility Equipment",
  "Respiratory & Oxygen Therapy Equipment",
  "Rehabilitation & Physiotherapy Equipment",
];

const advancedRoboticSystemsSubcategories = [
  "Robotic Surgery Systems",
  "Smart OT Integration Systems",
  "Endoscopy & Image-Guided Systems",
  "Telemedicine & Virtual Care Platforms",
  "AI-Enabled Diagnostic Platforms",
  "Navigation & Intra-Operative Systems",
  "Robotic Rehabilitation & Assistive Devices",
  "Smart ICU & Remote Monitoring Systems",
  "Robotic Pharmacy & Laboratory Automation",
];
const diagnosticsSubcategories = [
  "Laboratory Equipment",
  "Hematology & Blood Analyzers",
  "Biochemistry & Immunoassay",
  "Microbiology Equipment",
  "Molecular Diagnostics",
  "Diagnostic Kits & Strips",
  "Point-of-Care Testing Devices",
  "Sample Collection & Processing",
  "Imaging Diagnostics (Basic Equipment)",
  "Laboratory IT & Reporting Tools",
];
const hospitalFurnitureSubcategories = [
  "Hospital Beds",
  "Examination & OPD Furniture",
  "ICU & Patient Room Furniture",
  "OT & Procedure Room Furniture",
  "Ward Furniture",
  "Stretchers & Trolleys",
  "Pediatric & Neonatal Furniture",
  "Reception & Administrative Furniture",
  "Cafeteria & Utility Furniture",
  "Specialized Furniture",
];
const hospitalITSubcategories = [
  "Hospital Information Systems (HIS)",
  "Laboratory Information Systems (LIS)",
  "Telemedicine & Virtual Care Platforms",
  "Queue & Token Management Systems",
  "Billing, Inventory & Pharmacy Software",
  "HR, Payroll & Roster Systems",
  "Nursing & Clinical Workflow Tools",
  "Security, Access & Backup Systems",
  "Hospital Analytics & Dashboard Systems",
  "Radiology & Imaging Software (PACS & RIS)",
  "Electronic Medical Records (EMR) Systems",
];
const kitsAndBundlesSubcategories = [
  "Surgical Procedure Kits",
  "Dressing & Wound Care Kits",
  "Catheterization Kits",
  "Delivery & Obstetric Kits",
  "Sampling & Collection Kits",
  "IV Infusion & Injection Kits",
  "Anesthesia & Airway Management Kits",
  "Emergency & Trauma Kits",
  "Isolation & Infection Control Kits",
  "Diagnostic Bundles",
];
const facilityAndUtilitiesSubcategories = [
  "Housekeeping & Cleaning Equipment",
  "Stationery & Patient Band",
  "Laundry & Linen Management",
  "Water Supply & Plumbing",
  "Electrical & Power Backup Systems",
  "Fire Safety & Disaster Management",
  "Air Conditioning, Ventilation & HVAC",
  "Signage & Wayfinding",
  "Maintenance Tools & Engineering Services",
  "Biomedical Waste (BMW) Management",
];
const specialtyPackagesSubcategories = [
  "ICU Setup Packages",
  "Operation Theatre Setup Packages",
  "OPD & Consultation Room Packages",
  "Diagnostic Lab Packages",
  "Radiology & Imaging Packages",
  "Dental Clinic Setup Packages",
  "Dialysis Centre Packages",
  "Emergency & Trauma Room Packages",
  "Mobile Clinic & PHC/CHC Kits",
  "Chemotherapy & Oncology Daycare Packages",
  "Labour Room & Maternity Ward Packages",
];

export default function Header() {
   const cart = useCartStore((state) => state.cart) || [];
   const wishlist = useWishlistStore((state) => state.wishlist) || [];
   const { user, removeUser } = useUserStore((state) => state);
   const { seller, removeSeller } = useSellerStore((state) => state);
  // const isAdmin = user && user.role === "Admin";

   const [isCartOpen, setIsCartOpen] = useState(false);
   const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [subcategoryTop, setSubcategoryTop] = useState<number>(0);

  const categoryRef = useRef<HTMLDivElement | null>(null);
  const categoryItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // --- search state wired (minimal) ---
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced fetch for suggestions (uses relative API path like your working page)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSug(false);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v2/product/search?q=${encodeURIComponent(query)}`);
        // defensive parsing
        if (!res.ok) {
          setSuggestions([]);
          setShowSug(false);
          return;
        }
        const data = await res.json().catch(() => ({}));
        const products = (data && (data.products || data.items || data.results)) || [];
        setSuggestions(products);
        setShowSug(Array.isArray(products) && products.length > 0);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
        setShowSug(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Close suggestions when clicking outside the search area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSug(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // function openCartHandler() {
  //   setIsCartOpen((prev) => !prev);
  // }

  // function openWishlistHandler() {
  //   setIsWishlistOpen((prev) => !prev);
  // }

  // async function logoutHandler() {
  //   try {
  //     let url = "/api/v2/user/logout";
  //     if (seller) {
  //       url = "/api/v2/shop/logout";
  //     }
  //     const res = await fetch(url);
  //     if (!res.ok) throw new Error("Something went wrong");
  //     removeUser();
  //     removeSeller();
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  const getSubcategories = (category: string): string[] => {
    switch (category) {
      case "Consumables":
        return consumablesSubcategories;
      case "Instruments":
        return instrumentsSubcategories;
      case "Medical Equipment":
        return medicalEquipmentSubcategories;
      case "Advanced & Robotic Systems":
        return advancedRoboticSystemsSubcategories;
      case "Diagnostics":
        return diagnosticsSubcategories;
      case "Hospital Furniture":
        return hospitalFurnitureSubcategories;
      case "Hospital IT & Software":
        return hospitalITSubcategories;
      case "Specialty Packages":
        return specialtyPackagesSubcategories;
      case "Kits & Bundles":
        return kitsAndBundlesSubcategories;
      case "Facility & Utilities":
        return facilityAndUtilitiesSubcategories;
      case "Pharmaceuticals & Therapeutics":
        return [];
      default:
        return [];
    }
  };

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

  // ---- ONLY THIS FUNCTION CHANGED ----
  // keyboard navigation for suggestions
function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActiveIdx((i) => Math.max(i - 1, 0));
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (query.trim()) {
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

  // ------------------------------------

  return (
    <header className="w-full px-4 sm:px-6 max-w-screen-xl mx-auto h-24 flex items-center justify-between gap-6 relative font-montserrat">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Logo />
      </div>

      {/* Category + Search */}
      <div
        ref={categoryRef}
        className="relative flex-1 max-w-[600px] text-[#1C647C] z-50"
      >
        <div className="flex items-center h-[42px] rounded-full border-2 overflow-hidden bg-white w-full" ref={containerRef}>
          <button
            onClick={() => {
              setIsCategoryOpen((prev) => !prev);
              setHoveredCategory(null);
            }}
            className="flex items-center px-4 bg-[#f5f5f5] text-sm font-medium gap-1 border-r h-full whitespace-nowrap "
          >
            📦 Categories
            <IoIosArrowForward className="rotate-90 transition-transform duration-200" />
          </button>

          {/* <-- SEARCH INPUT (wired only) --> */}
          <input
            type="text"
            placeholder="Search"
            className="flex-1 px-4 font-montserrat text-sm outline-none bg-white text-[#1C647C] placeholder-[#1C647C] h-full"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(-1);
            }}
            onKeyDown={handleSearchKeyDown}
            aria-autocomplete="list"
            aria-expanded={showSug}
            aria-controls="search-suggestion-list"
          />

          <button
            className="flex items-center justify-center px-3 bg-[#006666] hover:bg-[#005555] h-full"
            onClick={() => {
              if (suggestions.length > 0 && activeIdx >= 0) {
                const sel = suggestions[activeIdx];
                const id = (sel as any)._id || (sel as any).id;
                if (id) navigate(`/product/${id}`);
              } else if (query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query)}`);
              }
              setShowSug(false);
              setActiveIdx(-1);
              setQuery("");
            }}
          >
            <AiOutlineSearch size={20} color="white" />
          </button>
        </div>

        {/* Category Dropdown */}
        {isCategoryOpen && (
          <div className="absolute mt-2 z-50 flex">
            <div className="relative bg-white shadow-lg border w-60  ">
              {categories.map((cat) => (
                <div
                  key={cat}
                  ref={(el) => (categoryItemRefs.current[cat] = el)}
                  onMouseEnter={() => {
                    setHoveredCategory(cat);
                    const parent = categoryRef.current;
                    const item = categoryItemRefs.current[cat];
                    if (parent && item) {
                      const parentRect = parent.getBoundingClientRect();
                      const itemRect = item.getBoundingClientRect();
                      setSubcategoryTop(itemRect.top - parentRect.top);
                    }
                  }}
                  className="flex justify-between items-center  px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {cat}
                  <IoIosArrowForward />
                </div>
              ))}

              {/* Subcategory Panel */}
              {hoveredCategory && (
                <div
                  className="absolute left-full ml-2  bg-white shadow-lg border w-[90vw] sm:w-[600px] p-4 grid grid-cols-2 sm:grid-cols-2 gap-4"
                  style={{ top: subcategoryTop }}
                  onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {getSubcategories(hoveredCategory).map((sub) => (
                    <div
                      key={sub}
                      className="text-sm text-gray-700 hover:underline cursor-pointer"
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggestions dropdown (keeps UI exactly like your working page) */}
{showSug && suggestions.length > 0 && (
  <ul
    id="search-suggestion-list"
    role="listbox"
    className="absolute left-0 right-0 mt-2 z-50 max-h-72 overflow-auto bg-white rounded-md shadow-lg border border-gray-200"
  >
    {suggestions.map((p, i) => {
      const id = (p as any)._id || (p as any).id;
      // const imgSrc =
      //   (p as any).images && (p as any).images.length
      //     ? `${BASE_URL}/${(p as any).images[0]}`
      //     : "/image60.png";
      return (
        <li
          key={id || `${p.name}-${i}`}
          onMouseDown={() => { // ✅ use onMouseDown
            if (id) navigate(`/product/${id}`);
            setShowSug(false);
            setQuery("");
            setActiveIdx(-1);
          }}
          className={`flex items-center gap-3 p-3 cursor-pointer ${
            i === activeIdx ? "bg-gray-100" : "hover:bg-gray-50"
          }`}
          role="option"
          aria-selected={i === activeIdx}
        >
          <img
            src={placeholderImg} // ✅ now uses correct product image
            alt={p.name}
            className="w-12 h-12 object-contain bg-gray-100 rounded"
          />
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-gray-800 line-clamp-1">{p.name}</span>
            <span className="text-gray-500 text-xs">{(p as any).category}</span>
          </div>
        </li>
      );
    })}
  </ul>
)}

      </div>

      {/* Navigation */}
      {/* Navigation (links row above, icons row below) */}
            {/* Navigation: links row above, icons row below (centered under search) */}
            {/* Navigation: links row above, icons row below (centered under search) */}
            {/* Navigation: links row above, icons row below (no green bg) */}
      {/* Navigation: links row above, icons row below (centered under search) */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[600px] flex flex-col items-center">
          {/* Links row (centered) */}
          <nav className="w-full flex justify-center gap-5 text-sm text-[#1C647C] font-montserrat">
            <Link to="/specialty" className="flex items-center gap-2 whitespace-nowrap">🏥 By Specialty</Link>
            <Link to="/get-quote" className="flex items-center gap-2 whitespace-nowrap">📄 Get Quote</Link>
            <Link to="/user" className="flex items-center gap-2 whitespace-nowrap">👤 My Account</Link>
            <Link to="/support" className="flex items-center gap-2 whitespace-nowrap">📞 Support</Link>
          </nav>

          {/* Icons row (centered directly below links) */}
          <div className="w-full flex justify-center gap-8 mt-3 items-center">
            {/* Login (icon + label) */}
            {(!user && !seller) ? (
              <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-[#1C647C] font-montserrat"
              >
              <AiOutlineUser size={18} />
              <span>Login</span>
            </Link>
              ):(
                  <button
               onClick={logoutHandler}
              className="flex items-center gap-2 text-sm text-[#1C647C] font-montserrat"
              >
              <AiOutlineUser size={18} />
              <span>Logout</span>
            </button>
              )
            }

            {/* Wishlist button (icon + label) */}
            <button
              onClick={openWishlistHandler}
              aria-label="Open Wishlist"
              className="focus:outline-none"
            >
              <div className="flex items-center gap-2 px-2 py-1 rounded-full cursor-pointer text-sm text-[#1C647C] font-montserrat">
                <div className="relative inline-flex items-center justify-center">
                  <AiOutlineHeart size={18} />
                  <span className="absolute -top-2 -right-2 rounded-full bg-[#3bc177] w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                </div>
                <span className="text-sm text-[#1C647C] font-montserrat">Wishlist</span>
              </div>
            </button>

            {/* Cart button (icon + label) */}
            <button
              onClick={openCartHandler}
              aria-label="Open Cart"
              className="focus:outline-none"
            >
              <div className="flex items-center gap-2 px-2 py-1 rounded-full cursor-pointer text-sm text-[#1C647C] font-montserrat">
                <div className="relative inline-flex items-center justify-center">
                  <AiOutlineShoppingCart size={18} />
                  <span className="absolute -top-2 -right-2 rounded-full bg-[#3bc177] w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center">
                    {cart.length}
                  </span>
                </div>
                <span className="text-sm text-[#1C647C] font-montserrat">Cart</span>
              </div>
            </button>
          </div>
        </div>
      </div>





      {/* Optionally render Cart or Wishlist components here */}
      {isCartOpen && <Cart cartOpenHandler={openCartHandler} />}
      {isWishlistOpen && <Wishlist wishlistOpenHandler={openWishlistHandler} />}
      

    </header>
  );
}
