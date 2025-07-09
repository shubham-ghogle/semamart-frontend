
import { useState } from "react";
import { NavbarIcons } from "../UI/NavbarIcons";

export default function Navbar() {
  const [selectedName, setSelectedName] = useState("");

  const names = ["Equipment", "Consumables", "Pharmaceutical"];

  const getIcon = (name: string) => {
    switch (name) {
      case "Equipment":
        return <NavbarIcons show={[4]} />;
      case "Consumables":
         return <NavbarIcons show={[5]} />;
      case "Pharmaceutical":
         return <NavbarIcons show={[6]} />;
      default:
        return null;
    }
  };

  const categories = [
    {
      label: "Medical Furniture",
      icon: <NavbarIcons show={[0]} />,
      options: ["Hospital Bed", "Examination Table", "Stretcher"],
    },
    {
      label: "Medical Instruments",
      icon: <NavbarIcons show={[1]} />,
      options: ["Scalpel", "Forceps", "Stethoscope"],
    },
    {
      label: "Medical Equipment's",
      icon: <NavbarIcons show={[2]} />,
      options: ["X-Ray Machine", "ECG Monitor", "Ultrasound"],
    },
    {
      label: "Miscellaneous Products",
      icon: <NavbarIcons show={[3]} />,
      options: ["Gloves", "Masks", "Sanitizers"],
    },
  ];

  return (
    <>
      <div className="mx-auto text-center border py-8">
        {/* Button Group */}
          <div className="flex justify-center mb-12">
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
        <div className="flex justify-center gap-20 flex-wrap text-[14px] leading-[21px] tracking-[0px] font-[Plus_Jakarta_Sans]">
          {categories.map((cat) => (
            <div key={cat.label} className="relative">
              <div className="absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none">
                {cat.icon}
              </div>
              <select className="pl-10 pr-4 py-2 outline-none  text-gray-700">
                <option disabled selected>
                  {cat.label}
                </option>
                {cat.options.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
