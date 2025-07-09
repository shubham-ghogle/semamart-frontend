import { ButtonHTMLAttributes, ReactNode } from "react";

type ActionBtnProps = {
  children: ReactNode;
  width?: number;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ActionBtn({ onClick, children, ...btnProps }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      className="w-[150px] bg-accentYellow h-[50px] flex items-center justify-center rounded hover:scale-105 transition-all duration-200 ease-out disabled:bg-gray-400 mr-2"
      {...btnProps}
    >
      <span className="text-slate-800 font-semibold flex items-center">
        {children}
      </span>
    </button>
  );
}

export function SecondryBtn({
  onClick,
  children,
  width = 150,
}: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      className="border-darkBlue border-2 h-[50px] my-3 flex items-center justify-center rounded cursor-pointer bg-white"
      style={{ width: width }}
    >
      <span className="text-darkBlue font-semibold flex items-center">
        {children}
      </span>
    </button>
  );
}
