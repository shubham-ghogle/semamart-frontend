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
        <div className="flex justify-center mb-8 mt-8">
          <div className="flex gap-[60px] bg-white border border-gray-300 rounded-full px-[19px] py-[5px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.06)]">
            {names.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedName(name)}
                className={`flex items-center gap-2 px-10 py-2 text-lg rounded-full font-semibold transition ${
                  selectedName === name
                    ? "bg-[#1C647C] text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
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
            backgroundColor: "rgba(28, 100, 124, 1)",
            color: "white",
          }}
        >
          <div className="flex justify-around px-6 flex-wrap text-[14px] leading-[21px] tracking-[0px] font-bold font-jakarta">
  {categories.map((cat) => (
    <div key={cat.label} className="relative">
      {/* White Icon */}
      <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none text-white">
        {cat.icon}
      </div>

      {/* Dropdown */}
      <select
        className="pl-10 pr-4 py-2 text-white"
        style={{
          backgroundColor: "rgba(28, 100, 124, 1)",
        }}
      >
        <option disabled selected className="text-gray-300 bg-white">
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
