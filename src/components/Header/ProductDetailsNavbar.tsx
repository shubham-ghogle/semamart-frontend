import { useState } from "react";
import { ProductDetailsIcons } from "../UI/ProductDetailsIcons";

export default function Navbar() {
  const [selectedName, setSelectedName] = useState("");

  const names = ["Equipment", "Consumables", "Pharmaceutical"];

  const getIcon = (name: string) => {
    switch (name) {
      case "Equipment":
        return <ProductDetailsIcons show={[4]} />;
      case "Consumables":
        return <ProductDetailsIcons show={[5]} />;
      case "Pharmaceutical":
        return <ProductDetailsIcons show={[6]} />;
      default:
        return null;
    }
  };

    const getBackgroundColor = (name: string) => {
    switch (name) {
      case "Equipment":
        return "#1C647C";
      case "Consumables":
        return "#20A975";
      case "Pharmaceutical":
        return "#E7663E";
      default:
        return "#F8F8F8";
    }
  };

  const categories = [
    {
      label: "Medical Furniture",
      icon: <ProductDetailsIcons show={[0]} />,
      options: ["Hospital Bed", "Examination Table", "Stretcher"],
    },
    {
      label: "Medical Instruments",
      icon: <ProductDetailsIcons show={[1]} />,
      options: ["Scalpel", "Forceps", "Stethoscope"],
    },
    {
      label: "Medical Equipment's",
      icon: <ProductDetailsIcons show={[2]} />,
      options: ["X-Ray Machine", "ECG Monitor", "Ultrasound"],
    },
    {
      label: "Miscellaneous Products",
      icon: <ProductDetailsIcons show={[3]} />,
      options: ["Gloves", "Masks", "Sanitizers"],
    },
  ];

  return (
    <>
      <div className="mx-auto text-center border-t mb-3">
        {/* Button Group */}
                <div className="flex justify-center my-8">
                  <div
                className="flex items-center gap-[50px] rounded-full border px-[10px] py-[8px]"
                style={{
                  width: "720px",
                  height: "60px",
                  background: "#F8F8F8",
                  border: "1px solid #DEDEDE",
                  opacity: 1,
                  borderRadius: "100px",
                  boxShadow:
                    "inset 0px 3px 4px 0px #00000026, inset 0px 0px 4px 0px #00000040",
                }}
              >
              {names.map((name) => (
                <button
              key={name}
              type="button"
              onClick={() => setSelectedName(name)}
              className={`flex items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 ${
                selectedName === name
                  ? "text-white"
                  : " hover:bg-gray-100"
              }`}
              style={{
                width: "200px",
                height: "44px",
                opacity: 1,
                borderRadius: "100px",
                padding: "10px 20px",
                gap: "5px",
                 
                backgroundColor: selectedName === name ? getBackgroundColor(name) : "#F8F8F8",
                  
    
  
                fontFamily: "Roboto, sans-serif",
                fontWeight: 500, // Rounded from 455 to nearest valid value
                fontStyle: "normal",
                fontSize: "18px",
                lineHeight: "100%",
                letterSpacing: "0.01em",
                color: selectedName === name ? "#FFFFFF" : "#6B7280",
              }}
            >
            {getIcon(name)}
            {name}
          </button>
        ))}
      </div>
    
        </div>

        {/* Dropdowns with Icons */}
       <div
  className="mx-auto max-w-6xl px-4 py-4 rounded-b-xl shadow-md"
  style={{
    backgroundColor:
      selectedName === "Equipment"
        ? "#1C647C"
        : selectedName === "Consumables"
        ? "#20A975"
        : selectedName === "Pharmaceutical"
        ? "#E7663E"
        : "#1C647C", // default
    color: "white",
    
  }}
>
  <div className="flex justify-around px-6 flex-wrap text-[14px] leading-[21px] tracking-[0px] font-bold font-jakarta gap-4">
    {categories.map((cat) => (
      <div key={cat.label} className="relative">
        {/* Icon positioned inside the select */}
        <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none text-white">
          {cat.icon}
        </div>

        {/* Dropdown */}
        <select
        className="pl-10 pr-4 py-2 text-white"
        style={{
    backgroundColor:
      selectedName === "Equipment"
        ? "#1C647C"
        : selectedName === "Consumables"
        ? "#20A975"
        : selectedName === "Pharmaceutical"
        ? "#E7663E"
        : "#1C647C", // default
    
  }}
      >
        <option disabled selected className="text-gray-300 bg-white font-jakarta font-bold text-[14px] leading-[21px]">
          {cat.label}
        </option>
        {cat.options.map((opt) => (
          <option key={opt} className="text-black bg-white">
            {opt}
          </option>
        ))}
      </select>
      </div>
    ))}
  </div>


        </div>
      </div>
      <span className="text-xs text-gray-400 tracking-wide ml-16">
        Consumables &gt; Miscellaneous Products &gt; <span className="font-semibold text-gray-600">Medical Furniture</span>
      </span>

    </>
  );
}
