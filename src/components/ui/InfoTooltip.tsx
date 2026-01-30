import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
  description: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ description }) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  // Function to calculate tooltip position
  const updateCoords = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY - 8, // 8px above icon
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  };

  // Update position on hover, scroll, and resize
  useEffect(() => {
    if (!show) return;

    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);

    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [show]);

  return (
    <span
      ref={spanRef}
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {/* Info Icon */}
      <span className="ml-1 flex h-3 w-3 mt-1 items-center justify-center rounded-full bg-gray-200 text-black text-xs font-semibold cursor-pointer">
        i
      </span>

      {/* Tooltip via portal */}
      {show && coords &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, -100%)",
              zIndex: 9999,
              width: "20rem",
            }}
            className="
              bg-white
              text-gray-800
              text-sm
              p-3
              rounded-lg
              shadow-lg
              border
            "
          >
            {description}
          </div>,
          document.body
        )}
    </span>
  );
};
