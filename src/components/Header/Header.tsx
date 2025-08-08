import { Link } from "react-router-dom";
import { ActionBtn, SecondryBtn } from "../UI/Buttons";
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
import { useState, useRef, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

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
  "Laboratory IT & Reporting Tools"
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
  "Specialized Furniture"
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
  "Diagnostic Bundles"
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
  const isAdmin = user && user.role === "Admin";

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [subcategoryTop, setSubcategoryTop] = useState<number>(0);

  const categoryRef = useRef<HTMLDivElement | null>(null);
  const categoryItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  return (

  <header className="w-full px-4 sm:px-6 max-w-screen-xl mx-auto h-24 flex items-center justify-between gap-6 relative">
    {/* Logo */}
    <div className="flex-shrink-0">
      <Logo />
    </div>

    {/* Category + Search */}
    <div
      ref={categoryRef}
      className="relative flex-1 max-w-[600px] text-[#1C647C] z-50"
    >
      <div className="flex items-center h-[42px] rounded-full border-2 overflow-hidden bg-white w-full">
        <button
          onClick={() => {
            setIsCategoryOpen((prev) => !prev);
            setHoveredCategory(null);
          }}
          className="flex items-center px-4 bg-[#f5f5f5] text-sm font-medium gap-1 border-r h-full whitespace-nowrap font-montserrat"
        >
          📦 Categories
          <IoIosArrowForward className="rotate-90 transition-transform duration-200" />
        </button>

        <input
          type="text"
          placeholder="Search"
          className="flex-1 px-4 font-montserrat text-sm outline-none font-poppins bg-white text-[#1C647C] placeholder-[#1C647C] h-full"
        />

        <button className="flex items-center justify-center px-3 bg-[#006666] hover:bg-[#005555] h-full">
          <AiOutlineSearch size={20} color="white" />
        </button>
      </div>

      {/* Category Dropdown */}
      {isCategoryOpen && (
        <div className="absolute mt-2 z-50 flex">
          <div className="relative bg-white shadow-lg border w-60  font-montserrat">
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
                className="flex justify-between items-center font-montserrat px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {cat}
                <IoIosArrowForward />
              </div>
            ))}

            {/* Subcategory Panel */}
            {hoveredCategory && (
              <div
                className="absolute left-full ml-2 font-montserrat bg-white shadow-lg border w-[90vw] sm:w-[600px] p-4 grid grid-cols-2 sm:grid-cols-2 gap-4"
                style={{ top: subcategoryTop }}
                onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {getSubcategories(hoveredCategory).map((sub) => (
                  <div
                    key={sub}
                    className="text-sm text-gray-700 hover:underline font-montserrat cursor-pointer"
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

    {/* Navigation */}
    <nav className="flex items-center gap-5 flex-shrink-0 whitespace-nowrap font-montserrat">
      <Link
        to="/specialty"
        className="flex items-center gap-1 text-sm font-medium text-[#1C647C]  whitespace-nowrap"
      >
        🏥 By Specialty
      </Link>
      <Link
        to="/get-quote"
        className="flex items-center gap-1 text-sm font-medium text-[#1C647C]  whitespace-nowrap"
      >
        📄 Get Quote
      </Link>
      <Link
        to="/account"
        className="flex font-montserrat items-center gap-1 text-sm font-medium text-[#1C647C]  whitespace-nowrap"
      >
        👤 My Account
      </Link>
      <Link
        to="/support"
        className="flex font-montserrat items-center gap-1 text-sm font-medium text-[#1C647C]  whitespace-nowrap"
      >
        📞 Support
      </Link>
    </nav>
  </header>
);

}