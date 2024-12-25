import { useState } from "react";
import { BiMenuAltLeft } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";

export function CategoriesMenu() {
  const [isCatOpen, setIsCatOpen] = useState<boolean>(false);

  return (
    <article className="h-full w-64 relative">
      <button
        onClick={() => setIsCatOpen((p) => !p)}
        className="bg-white px-4 py-2 w-full rounded-t mt-[18px] text-lg font-medium text-slate-700 flex items-center gap-2"
      >
        <BiMenuAltLeft size={30} />
        All Categories
        <IoIosArrowDown size={20} className="ml-auto" />
      </button>
      {/* {isCatOpen && ( */}
      <menu
        className={
          "cate-btn absolute inset-x-0 bg-white shadow-md space-y-5 overflow-clip transition-[height,visibility,padding] ease-in-out duration-300 text-lg " +
          (isCatOpen ? "h-auto px-4 pb-2 pt-6 visible" : "h-0 invisible")
        }
      >
        <li>Hello</li>
        <li>Hello</li>
        <li>Hello</li>
        <li>Hello</li>
        <li>Hello</li>
        <li>Hello</li>
        <li>Hello</li>
      </menu>
      {/* )} */}
    </article>
  );
}
