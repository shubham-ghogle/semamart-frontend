import { Product } from "@/Types/types";
import BestSellerShowcase from "@/components/Homepage/BestSellerShowcase";
import { GiCrown } from "react-icons/gi";
import { FaShippingFast } from "react-icons/fa";
import { FaCapsules } from "react-icons/fa6";
import MediqopDepartmentsSection from "./MediqopDepartmentsSection";
import {
  MEDICOP_SHOWCASE_PRODUCTS,
  MEDIQOP_HOME_DEPARTMENTS,
} from "./data";

const ROW_STYLES = [
  {
    icon: <GiCrown className="text-[#3B0B68]" size={18} />,
    bgFrom: "#2a0450",
    bgTo: "#39104f",
    iconBg: "#fbbf24",
    accentBg: "#ec4899",
    textColor: "#ffffff",
  },
  {
    icon: <FaShippingFast size={18} />,
    bgFrom: "#0ea5e9",
    bgTo: "#0369a1",
    iconBg: "#ffffff",
    accentBg: "#06b6d4",
    textColor: "#04263a",
  },
  {
    icon: <FaCapsules className="text-white" size={18} />,
    bgFrom: "#065f46",
    bgTo: "#047857",
    iconBg: "#10b981",
    accentBg: "#34d399",
    textColor: "#ffffff",
  },
  {
    icon: <FaShippingFast size={18} />,
    bgFrom: "#7c2d12",
    bgTo: "#9a3412",
    iconBg: "#ffedd5",
    accentBg: "#fdba74",
    textColor: "#fff7ed",
  },
  {
    icon: <GiCrown className="text-[#3B0B68]" size={18} />,
    bgFrom: "#1e3a8a",
    bgTo: "#1d4ed8",
    iconBg: "#dbeafe",
    accentBg: "#60a5fa",
    textColor: "#eff6ff",
  },
  {
    icon: <FaCapsules className="text-white" size={18} />,
    bgFrom: "#134e4a",
    bgTo: "#0f766e",
    iconBg: "#99f6e4",
    accentBg: "#2dd4bf",
    textColor: "#f0fdfa",
  },
] as const;

export default function MedicopHomepage() {
  const products = MEDICOP_SHOWCASE_PRODUCTS as unknown as Product[];

  return (
    <section className="w-full bg-gray-100">
      <div className="mx-auto w-full space-y-12 px-6 pt-8">
        <MediqopDepartmentsSection />

        {MEDIQOP_HOME_DEPARTMENTS.map((department, index) => {
          const style = ROW_STYLES[index % ROW_STYLES.length];

          return (
            <BestSellerShowcase
              key={department}
              products={products}
              status="success"
              cardMode="medicop"
              title={department}
              badgeText=""
              subText=""
              minimalHeader
              maxItems={10}
              viewAllLink={`/medicop/products?department=${encodeURIComponent(department)}`}
              {...style}
            />
          );
        })}
      </div>
    </section>
  );
}
