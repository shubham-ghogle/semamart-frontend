import { NavLink } from "react-router";
import { AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai";
import { CategoriesMenu } from "./Navbar.Ui";

export default function Navbar() {
  return (
    <nav className="bg-darkBlue h-16 px-14 sticky top-0 flex items-center justify-between">
      <section className="h-full">
        <CategoriesMenu />
      </section>
      <ol className="flex items-center gap-8">
        <NavLinks destination="/" label="Home" />
        <NavLinks destination="/best-selling" label="Best Selling" />
        <NavLinks destination="/products" label="Products" />
        <NavLinks destination="/events" label="Events" />
        <NavLinks destination="/faq" label="FAQ" />
      </ol>
      <section className="flex items-center gap-4">
        <figure className="relative">
          <AiOutlineShoppingCart size={30} color="rgb(255 255 255 / 83%)" />
          <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
            {/* {cart && cart.length} */}0
          </span>
        </figure>
        <figure className="relative">
          <AiOutlineHeart size={30} color="rgb(255 255 255 / 83%)" />
          <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
            {/* {cart && cart.length} */}0
          </span>
        </figure>
        <figure>
          <img
            src="/placeholder.png"
            alt="profile avatar"
            className="w-[35px] h-[35px] rounded-full"
            width={30}
          />
        </figure>
      </section>
    </nav>
  );
}

type NavlinksProps = {
  label: string;
  destination: string;
};

function NavLinks({ label, destination }: NavlinksProps) {
  return (
    <li className="font-medium">
      <NavLink
        to={destination}
        className={({ isActive }) =>
          isActive ? "text-accentYellow" : "text-white"
        }
      >
        {label}
      </NavLink>
    </li>
  );
}
