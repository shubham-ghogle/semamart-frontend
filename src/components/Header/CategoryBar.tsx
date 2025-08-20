import { useMemo } from "react";
import { toast } from "react-toastify";


// Use category-specific icons from a free CDN (icons8, flaticon, etc.)
const categoryImages: Record<string, string> = {
  "Consumables": "https://img.icons8.com/color/48/bandage.png", // Bandage icon for consumables
  "Instruments": "https://img.icons8.com/color/48/surgical-scissors.png",
  "Medical Equipment": "https://img.icons8.com/color/48/heart-monitor.png",
  "Advanced & Robotic Systems": "https://img.icons8.com/color/48/robot-2.png",
  "Diagnostics": "https://img.icons8.com/color/48/microscope.png",
  "Hospital Furniture": "https://img.icons8.com/color/48/hospital-bed.png",
  "Pharmaceuticals & Therapeutics": "https://img.icons8.com/color/48/pill.png",
  "Hospital IT & Software": "https://img.icons8.com/color/48/computer.png",
"Kits & Bundles": "https://img.icons8.com/color/48/box--v2.png", // Box icon for kits & bundles
  "Facility & Utilities": "https://img.icons8.com/color/48/fire-extinguisher.png",
  "Specialty Packages": "https://img.icons8.com/color/48/medical-doctor.png",
};

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

export default function CategoryBar() {
  // Randomly select 10 categories each render
  const randomCategories = useMemo(() => {
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, []);

  return (
    <div className="w-full bg-white border-b flex items-center justify-center py-3 overflow-x-auto">
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 w-full gap-0 px-0">
      {randomCategories.map((cat) => (
  <button
    key={cat}
    onClick={() => toast(cat)}
    className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 py-2 transition-all w-full"
    style={{ border: "none", boxShadow: "none" }}
  >
    <img
      src={categoryImages[cat]}
      alt={cat}
      className="w-10 h-10 mb-1 object-contain"
      loading="lazy"
    />
    <span className="text-xs font-semibold text-[#1C647C] text-center">{cat}</span>
  </button>
))}
      </div>
    </div>
  );
}