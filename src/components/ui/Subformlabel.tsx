import React from "react";

type SubformlabelProps = {
  children: React.ReactNode;
  required?: boolean;
};

const Subformlabel = ({ children, required = false }: SubformlabelProps) => {
  return (
    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
};

export default Subformlabel;
