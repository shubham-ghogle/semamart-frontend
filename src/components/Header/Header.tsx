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
import { FaSignOutAlt, } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { Logo } from "../UIComponents/Logo";
import placeholderImg from "../../../public/image60.png";
import Wishlist from "./Wishlist";
import Cart from "./Cart";
import { useState, useRef, useEffect } from "react";
import { Product } from "@/Types/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import { useSellerStore } from "@/store/sellerStore";


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
  // "Specialty Packages",
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

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);


  const categoryRef = useRef<HTMLDivElement | null>(null);
  const categoryItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);


  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsHovered(false);
      timeoutRef.current = null;
    }, 300);
  };

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



  return (
    <header className="w-full bg-white shadow-sm border-b font-montserrat">
      <div className="w-full max-w-screen-xl flex flex-col sm:flex-row items-center h-auto sm:h-20 px-4 sm:px-8 gap-2 sm:gap-0 mx-auto">

        {/* Logo (Left) */}
        <div className="flex items-center h-10 pr-4 flex-shrink-0">
          <Logo />
        </div>



        {/* Categories + Search */}
        <div className="flex flex-1 items-center h-full ">

          {/* Categories Button */}
          <div ref={categoryRef} className="relative h-full flex items-center">
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


            {/* Category Dropdown */}
            {isCategoryOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 flex">
                <div className="relative bg-white shadow-lg border w-60">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      ref={(el) => (categoryItemRefs.current[cat] = el)}
                      onMouseEnter={() => setHoveredCategory(cat)}
                      className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {cat}
                      <IoIosArrowForward />
                    </div>
                  ))}

                  {/* Subcategories */}
                  {hoveredCategory && (
                    <div
                      className="absolute left-full  bg-white shadow-lg border w-[90vw] sm:w-[350px] p-4 gap-4"
                      style={{ top: 0 }}
                      onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      {getSubcategories(hoveredCategory).map((sub) => (
                        <div
                          key={sub}
                          className="text-sm text-gray-700 hover:underline cursor-pointer p-2"
                        >
                          {sub}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div
            className="flex items-center h-full relative w-[350px] sm:w-[450px]"
            ref={containerRef}
          >
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="flex-1 px-4 text-sm outline-none bg-white text-[#1C647C] placeholder:text-xs placeholder-[#1C647C] h-8 border border-gray-200 rounded-none"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIdx(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              aria-autocomplete="list"
              aria-expanded={showSug}
              aria-controls="search-suggestion-list"
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            />
            <button
              className="flex items-center justify-center px-3 bg-[#006666] hover:bg-[#005555] h-8 rounded-r-full"
              onClick={() => {
                if (suggestions.length > 0 && activeIdx >= 0) {
                  const sel = suggestions[activeIdx];
                  const id = sel._id;
                  if (id) navigate(`/product/${id}`);
                } else if (query.trim()) {
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                }
                setShowSug(false);
                setActiveIdx(-1);
                setQuery("");
              }}
            >
              <AiOutlineSearch size={28} color="white" />
            </button>

            {/* Search Suggestions */}
            {showSug && suggestions.length > 0 && (
              <ul
                id="search-suggestion-list"
                role="listbox"
                className="absolute left-0 right-0 top-full mt-2 z-50 max-h-72 overflow-auto bg-white rounded-md shadow-lg border border-gray-200"
              >
                {suggestions.map((p, i) => {
                  const id = p._id;
                  return (
                    <li
                      key={id || `${p.name}-${i}`}
                      onMouseDown={() => {
                        if (id) navigate(`/product/${id}`);
                        setShowSug(false);
                        setQuery("");
                        setActiveIdx(-1);
                      }}
                      className={`flex items-center gap-3 p-3 cursor-pointer ${i === activeIdx ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                      role="option"
                      aria-selected={i === activeIdx}
                    >
                      <img
                        src={placeholderImg}
                        alt={p.name}
                        className="w-12 h-12 object-contain bg-gray-100 rounded"
                      />
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold text-gray-800 line-clamp-1">{p.name}</span>
                        <span className="text-gray-500 text-xs">{p.category}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side Links */}
        <div className="flex flex-wrap sm:flex-nowrap items-center text-[11px] ml-0 sm:ml-2 gap-1 flex-shrink-0 justify-center sm:justify-start w-full sm:w-auto">
          {/* Specialty and Get Quote */}
          <div className="flex items-center gap-2 font-montserrat text-[#1C647C]">
            <div
              className="relative inline-block text-left"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <Link
                to="/specialty"
                className="px-2 py-1 rounded-md flex"
              >
                <FaUserDoctor size={16} />
                <span> By Specialty</span>
              </Link>

              {isOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <ul className="py-1">
                    {specialtyPackagesSubcategories.map((item, index) => (
                      <li key={index}>
                        <Link
                          to={`/specialty/${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                          className="block px-3 py-1 text-[11px] text-gray-700 hover:bg-gray-100"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Link
              to="/get-quote"
              className="px-2 py-1 rounded-md transition flex"
            >
              <TbFileInvoice size={16} />
              Get Quote
            </Link>
          </div>

          {/* Login/Profile */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {user ? (
              <button
                className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-full font-montserrat transition-colors duration-200 ${isHovered ? "bg-[#1C647C] text-white" : "bg-white text-[#1C647C]"
                  }`}
              >
                <FaRegCircleUser size={16} />
                <span>{user.firstName?.split(" ")[0] || "Profile"}</span>
                <IoIosArrowForward
                  className={`transition-transform duration-200 ${isHovered ? "-rotate-90" : "rotate-90"
                    }`}
                  size={12}
                />
              </button>
            ) : (
              <Link
                to="/user"
                className={`flex items-center gap-1 px-2 py-1 rounded-full font-montserrat transition-colors duration-200 ${isHovered ? "bg-[#1C647C] text-white" : "bg-white text-[#1C647C]"
                  }`}
              >
                <FaRegCircleUser size={16} />
                <span>Login</span>
                <IoIosArrowForward
                  className={`transition-transform duration-200 ${isHovered ? "-rotate-90" : "rotate-90"
                    }`}
                  size={12}
                />
              </Link>
            )}

            {/* Hover Dropdown */}
            {isHovered && (
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
                    <Link to="/cart" className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100">
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
                    <button
                      onClick={logoutHandler}
                      className="flex items-center gap-2 px-3 py-1 w-full cursor-pointer hover:bg-gray-100 text-red-600"
                    >
                      <FaSignOutAlt size={14} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center px-3 py-1">
                      <span>New customer?</span>
                      <Link to="/signup" className="text-blue-600 text-[10px]">Sign Up</Link>
                    </div>
                    <hr />
                    <Link to="/user" className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100">
                      <FaRegCircleUser size={14} /> My Profile
                    </Link>
                    <Link to="/user/orders" className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100">
                      <RiShoppingBag4Line size={14} />
                      Orders
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100">
                      <AiOutlineHeart size={14} />  Wishlist
                    </Link>
                    <Link to="/rewards" className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100">  <IoGiftSharp size={14} /> Rewards</Link>
                    <Link to="/gift-cards" className="flex items-center gap-1 px-3 py-1 hover:bg-gray-100">
                      <BsCashStack size={14} />
                      Gift Cards
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Become a Seller */}
          <Link
            to="/signup-seller"
            className="px-2 py-1 rounded-md font-montserrat text-[#1C647C]"
          >
            Become a Seller
          </Link>



          {/* Wishlist Button */}
          <button
            onClick={openWishlistHandler}
            aria-label="Open Wishlist"
            className="relative flex items-center px-2 py-1 cursor-pointer rounded-full text-[11px] text-[#1C647C] hover:bg-[#155d72] hover:text-white transition-colors duration-200"
          >
            <div className="relative">
              <AiOutlineHeart size={16} />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 cursor-pointer -right-2 w-4 h-4 rounded-full bg-[#3bc177] text-white text-[9px] font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                  {wishlist.length}
                </span>
              )}
            </div>
          </button>
          {/* Cart Button */}
          <button
            onClick={openCartHandler}
            aria-label="Open Cart"
            className="relative flex items-center px-2 cursor-pointer py-1 rounded-full text-[11px] text-[#1C647C] hover:bg-[#155d72] hover:text-white transition-colors duration-200"
          >
            <div className="relative">
              <AiOutlineShoppingCart size={16} />
              {cart.length > 0 && (
                <span className="absolute -top-2 cursor-pointer -right-2 w-4 h-4 rounded-full bg-[#3bc177] text-white text-[9px] font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                  {cart.length}
                </span>
              )}
            </div>
          </button>


        </div>
      </div>

      {/* Modals */}
      {isCartOpen && <Cart cartOpenHandler={openCartHandler} />}
      {isWishlistOpen && <Wishlist wishlistOpenHandler={openWishlistHandler} />}
    </header>

  );
}
