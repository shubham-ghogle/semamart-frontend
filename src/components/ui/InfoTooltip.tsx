import React, { useState } from "react";

interface InfoTooltipProps {
  description: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ description }) => {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-black text-xs font-semibold cursor-pointer">
        i
      </span>

      {show && (
       <div
  className="
    absolute
    bottom-full
    mt-8
    w-80
    bg-white
    text-gray-800
    text-sm
    p-3
    rounded-lg
    shadow-lg
    border
    z-70
  "
>
  {description}
</div>

      )}
    </span>
  );
};
