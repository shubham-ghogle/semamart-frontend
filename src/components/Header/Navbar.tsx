import { Link, NavLink } from "react-router";
import { AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai";
import { CategoriesMenu } from "./Navbar.Ui";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useUserStore } from "../../store/userStore";
import { CgProfile } from "react-icons/cg";
import { useSellerStore } from "../../store/sellerStore";

export default function Navbar() {
  const cart = useCartStore((state) => state.cart);
  const wishlist = useWishlistStore((state) => state.wishlist);
  const { user } = useUserStore((state) => state);
  const { seller } = useSellerStore((state) => state);
  const isAdmin = user && user.role === "Admin";

  return (
    <nav className="bg-darkBlue h-16 px-14 sticky top-0 flex items-center justify-between z-[999]">
      <section className="h-full">
        <CategoriesMenu />
      </section>
      <ol className="flex items-center gap-8">
        <NavLinks destination="/" label="Home" />
        <NavLinks destination="/best-selling" label="Best Selling" />
        <NavLinks destination="/product" label="Products" />
        <NavLinks destination="/events" label="Events" />
        <NavLinks destination="/faq" label="FAQ" />
      </ol>
      <section className="flex items-center gap-4">
        <figure className="relative">
          <AiOutlineShoppingCart size={30} color="rgb(255 255 255 / 83%)" />
          <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
            {cart.length}
          </span>
        </figure>
        <figure className="relative">
          <AiOutlineHeart size={30} color="rgb(255 255 255 / 83%)" />
          <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
            {wishlist.length}
          </span>
        </figure>
        <figure>
          {user || seller ? (
            <section className="flex items-center gap-2">
              {seller && (
                <Link to="/seller">
                  <ProfileAvatar src={seller.avatar} />
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin">
                  <ProfileAvatar src={user.avatar} />
                </Link>
              )}
              {user && !isAdmin && (
                <Link to="/user">
                  <ProfileAvatar src={user.avatar} />
                </Link>
              )}
            </section>
          ) : (
            <Link to="/login">
              <CgProfile size={30} color="white" />
            </Link>
          )}
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

type ProfileAvatarProps = {
  src?: string;
};
function ProfileAvatar({ src }: ProfileAvatarProps) {
  if (!src) {
    src = "/placeholder.png";
  } else {
    src = "/baseUrl" + "/" + src;
  }
  return (
    <img
      src={src}
      alt="profile avatar"
      className="w-[35px] h-[35px] rounded-full border bg-white"
      width={35}
    />
  );
}
