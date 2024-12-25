import { Link } from "react-router";
import { ActionBtn } from "../UI/Buttons";
import { IoIosArrowForward } from "react-icons/io";
import { AiOutlineSearch } from "react-icons/ai";
import { Logo } from "../UI/Logo";

export default function Header() {
  return (
    <header className="w-11/12 mx-auto flex items-center justify-between h-24">
      <Logo />
      <article className="w-1/2 relative">
        <input
          className="border rounded px-2 h-10 w-full"
          type="text"
          placeholder="Search Products..."
        />
        <AiOutlineSearch
          size={30}
          className="absolute right-2 top-1.5 cursor-pointer"
        />
      </article>
      <Link to="#">
        <ActionBtn>
          Become Seller
          <IoIosArrowForward className="ml-1" />
        </ActionBtn>
      </Link>
    </header>
  );
}
