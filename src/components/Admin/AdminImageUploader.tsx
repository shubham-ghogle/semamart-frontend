import React, { useState } from "react";
import HeroSectionUploader from "../ui/HeroSectionUploader";
import SectionBannerUploader from "../ui/SectionBannerUploader";
// import { FiLayers } from "react-icons/fi";

const AdminImageUploader: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"hero" | "section">("hero");

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === "hero"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Hero Section
        </button>

        <button
          onClick={() => setActiveTab("section")}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === "section"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Section Banners
        </button>
      </div>

      {/* Active Component */}
      <div>
        {activeTab === "hero" && <HeroSectionUploader />}
        {activeTab === "section" && <SectionBannerUploader />}
      </div>
    </div>
  );
};

export default AdminImageUploader;
