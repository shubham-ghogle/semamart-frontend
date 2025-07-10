import  { useRef, useEffect, useState } from "react";
import { NavbarIcons } from "../UI/NavbarIcons";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathToNameMap: Record<string, string> = {
    "/equipments": "Equipment",
    "/": "Consumables",
    "/pharmaceutical": "Pharmaceutical",
  };
  const selectedName = pathToNameMap[location.pathname] || "Consumables";

  const names = ["Equipment", "Consumables", "Pharmaceutical"];
  const handleClick = (name: string) => {
    if (name === "Equipment") navigate("/equipments");
    if (name === "Consumables") navigate("/");
    if (name === "Pharmaceutical") navigate("/pharmaceutical");
  };

  // Refs + state for the sliding pill
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({
    Equipment: null,
    Consumables: null,
    Pharmaceutical: null,
  });
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const btn = buttonRefs.current[selectedName];
    const cont = containerRef.current;
    if (btn && cont) {
      const btnRect = btn.getBoundingClientRect();
      const contRect = cont.getBoundingClientRect();
      setIndicator({
        left: btnRect.left - contRect.left,
        width: btnRect.width,
      });
    }
  }, [selectedName]);

  const categories = [
    { label: "Medical Furniture", iconIdx: 0, options: ["Hospital Bed", "Examination Table", "Stretcher"] },
    { label: "Medical Instruments", iconIdx: 1, options: ["Scalpel", "Forceps", "Stethoscope"] },
    { label: "Medical Equipment's", iconIdx: 2, options: ["X-Ray Machine", "ECG Monitor", "Ultrasound"] },
    { label: "Miscellaneous Products", iconIdx: 3, options: ["Gloves", "Masks", "Sanitizers"] },
  ];

  return (
    <div className="mx-auto text-center border py-8">
      {/* Button Group */}
      <div className="flex justify-center mb-6">
        <div
          ref={containerRef}
          className="relative flex gap-[60px] bg-white border border-gray-300 rounded-full px-[19px] py-[5px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.06)]"
        >
          {/* Sliding pill */}
          <div
            className="absolute z-0 bg-[#1C647C] rounded-full transition-all duration-300 ease-out"
            style={{
              top: 1,
              height: "calc(100% - 2px)",
              left: indicator.left,
              width: indicator.width,
            }}
          />

          {names.map((name, idx) => {
            const isSel = selectedName === name;
            const iconColor = isSel ? "#FFFFFF" : "#A0A6B1";

            return (
              <button
                key={name}
                ref={(el) => (buttonRefs.current[name] = el)}
                onClick={() => handleClick(name)}
                className={`
                  relative z-10 flex items-center gap-2 px-10 py-2 text-lg rounded-full font-semibold transition-colors
                  ${isSel ? "text-white" : "text-[#A0A6B1] hover:text-black hover:bg-gray-100"}
                `}
              >
                {/* icon wrapper with fade */}
                <span
                  className="transition-opacity duration-300 ease-out"
                  style={{ opacity: isSel ? 1 : 0.5 }}
                >
                  <NavbarIcons show={[4 + idx]} color={iconColor} />
                </span>

                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropdowns */}
      <div className="flex justify-center gap-20 flex-wrap text-[14px] leading-[21px] font-jakarta font-black">
        {categories.map((cat) => (
          <div key={cat.label} className="relative">
            <div className="absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none z-10">
              {/* dropdown icon stays static gray */}
              <NavbarIcons show={[cat.iconIdx]} color="#3B3B3B" />
            </div>
            <select className="pl-10 pr-4 py-2 outline-none text-gray-700">
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
  );
}
