import React, { useState, useEffect } from "react";

type SliderItem = {
  name: string;
  link: string;
  type: "slider" | "banner-left" | "banner-right";
  file?: File;
  preview?: string;
  readonlyType?: boolean; // true for fixed banners
};

const AdminImageUploader: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"hero" | "banner">("hero");

  const [heroItems, setHeroItems] = useState<SliderItem[]>([]);
  const [bannerItems, setBannerItems] = useState<SliderItem[]>([
    { name: "Section Banner 1", link: "", type: "slider", readonlyType: true },
    { name: "Section Banner 2", link: "", type: "slider", readonlyType: true },
    { name: "Section Banner 3", link: "", type: "slider", readonlyType: true },
  ]);

  // Initialize Hero Section with fixed banners + 1 slider
  useEffect(() => {
    if (heroItems.length === 0) {
      setHeroItems([
        { name: "Left Banner", link: "", type: "banner-left", readonlyType: true },
        { name: "Right Banner", link: "", type: "banner-right", readonlyType: true },
        { name: "", link: "", type: "slider" },
      ]);
    }
  }, []);

  const handleChange = (
    index: number,
    field: keyof Omit<SliderItem, "file" | "preview" | "readonlyType">,
    value: string,
    section: "hero" | "banner"
  ) => {
    const items = section === "hero" ? [...heroItems] : [...bannerItems];
    items[index][field] = value as any;
    section === "hero" ? setHeroItems(items) : setBannerItems(items);
  };

  const handleFileSelect = (index: number, file?: File, section?: "hero" | "banner") => {
    const items = section === "hero" ? [...heroItems] : [...bannerItems];
    if (file) {
      if (items[index].preview) URL.revokeObjectURL(items[index].preview!);
      items[index].file = file;
      items[index].preview = URL.createObjectURL(file);
      section === "hero" ? setHeroItems(items) : setBannerItems(items);
    }
  };

  const addNewSlider = () => {
    setHeroItems([...heroItems, { name: "", link: "", type: "slider" }]);
  };

  const removeItem = (index: number, section: "hero" | "banner") => {
    const items = section === "hero" ? [...heroItems] : [...bannerItems];

    if (items[index].readonlyType) {
      alert("Cannot remove default banner.");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this item?")) return;

    if (items[index].preview) URL.revokeObjectURL(items[index].preview!);

    items.splice(index, 1);
    section === "hero" ? setHeroItems(items) : setBannerItems(items);
  };

  const handleSubmit = async (section: "hero" | "banner") => {
    const items = section === "hero" ? heroItems : bannerItems;
    try {
      for (let item of items) {
        if (!item.file) continue;

        const formData = new FormData();
        formData.append("title", item.name);
        formData.append("link", item.link);
        formData.append("type", item.type);
        formData.append("image", item.file);

        const response = await fetch("/api/v2/adminslider", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }
      }

      alert("All images uploaded successfully!");

      if (section === "hero") {
        setHeroItems([
          { name: "Left Banner", link: "", type: "banner-left", readonlyType: true },
          { name: "Right Banner", link: "", type: "banner-right", readonlyType: true },
          { name: "", link: "", type: "slider" },
          { name: "", link: "", type: "slider" },
          { name: "", link: "", type: "slider" },
        ]);
      } else {
        setBannerItems([]);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error uploading images: " + err.message);
    }
  };

  const renderItemsUI = (items: SliderItem[], section: "hero" | "banner") => (
    <>
      {items.map((item, index) => (
        <div key={index} className="border rounded-xl p-5 shadow-md relative space-y-4">

          {/* DELETE BUTTON (hidden for readonlyType) */}
          {!item.readonlyType && (
            <button
              aria-label={`Remove item ${index + 1}`}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-bold text-2xl leading-none"
              onClick={() => removeItem(index, section)}
            >
              &times;
            </button>
          )}

          <label className="block">
            <span className="block mb-1 font-semibold">Name</span>
            <input
              type="text"
              placeholder="Slider Name"
              value={item.name}
              onChange={(e) => handleChange(index, "name", e.target.value, section)}
              className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

          <label className="block">
            <span className="block mb-1 font-semibold">Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(index, e.target.files?.[0], section)}
              className="block"
            />
          </label>

          {item.preview && (
            <img
              src={item.preview}
              alt={`Preview for item ${index + 1}`}
              className="w-full h-48 object-cover rounded"
            />
          )}

          <label className="block">
            <span className="block mb-1 font-semibold">Link</span>
            <input
              type="text"
              placeholder="Link"
              value={item.link}
              onChange={(e) => handleChange(index, "link", e.target.value, section)}
              className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
        </div>
      ))}

      <div className="flex space-x-4 mt-4">
        {section === "hero" && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={addNewSlider}
            type="button"
          >
            + Add New Slider
          </button>
        )}

        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={() => handleSubmit(section)}
          type="button"
        >
          Save All
        </button>
      </div>
    </>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 flex space-x-6">
      {/* Left Panel */}
      <div className="w-1/4 space-y-4">
        <button
          className={`w-full py-2 rounded ${
            activeSection === "hero" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveSection("hero")}
        >
          Hero Section
        </button>
        <button
          className={`w-full py-2 rounded ${
            activeSection === "banner" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveSection("banner")}
        >
          Section Banner
        </button>
      </div>

      {/* Right Panel */}
      <div className="w-3/4 space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {activeSection === "hero" ? "Hero Section" : "Section Banners"}
        </h2>

        {activeSection === "hero"
          ? renderItemsUI(heroItems, "hero")
          : renderItemsUI(bannerItems, "banner")}
      </div>
    </div>
  );
};

export default AdminImageUploader;
