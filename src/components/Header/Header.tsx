import { Link } from "react-router-dom";
import { ActionBtn, SecondryBtn } from "../UI/Buttons";
import {
  AiOutlineHeart,
  AiOutlineShoppingCart,
  AiOutlineSearch,
  AiOutlineHome,
  AiOutlineUser,
} from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import { Logo } from "../UI/Logo";
import { useUserStore } from "../../store/userStore";
import { useSellerStore } from "../../store/sellerStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import Wishlist from "./Wishlist";
import Cart from "./Cart";
import { useState } from "react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function Header() {
  const cart = useCartStore((state) => state.cart) || [];
  const wishlist = useWishlistStore((state) => state.wishlist) || [];
  const { user, removeUser } = useUserStore((state) => state);
  const { seller, removeSeller } = useSellerStore((state) => state);
  const isAdmin = user && user.role === "Admin";
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  function openCartHandler() {
    setIsCartOpen((prev) => !prev);
  }

  function openWishlistHandler() {
    setIsWishlistOpen((prev) => !prev);
  }

  async function logoutHandler() {
    try {
      let url = "/api/v2/user/logout";
      if (seller) {
        url = "/api/v2/shop/logout";
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Something went wrong");
      removeUser();
      removeSeller();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <header className="w-11/12 mx-auto flex items-center justify-between h-24">
      {/* 1) Logo */}
      <Logo />

      {/* 2) Search Bar */}
      <article className="w-[402px] h-[42px]">
        <div className="relative w-full h-full">
          <input
            type="text"
            placeholder="Search"
            className="w-full h-full pl-4 pr-10 text-sm font-poppins font-normal rounded-full text-[#1C647C] placeholder-[#1C647C] bg-white outline-none"
          />
          <AiOutlineSearch
            size={28}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C647C] cursor-pointer"
          />
        </div>
      </article>

      {/* 3) Right-hand group: Become Seller + Icons */}
      <div className="flex items-center gap-4">
        {!user && !seller ? (
          <Link to="/signup-seller">
            <ActionBtn>
              Become Seller
              <IoIosArrowForward className="ml-1" />
            </ActionBtn>
          </Link>
        ) : (
          <SecondryBtn width={100} onClick={logoutHandler}>
            Logout
          </SecondryBtn>
        )}

        <section className="flex items-center gap-4">
          {/* Home Icon */}
          <Link to="/">
            <div className="bg-[#006666] p-2 rounded-full">
              <AiOutlineHome size={24} color="white" />
            </div>
          </Link>

          {/* Cart */}
          <button onClick={openCartHandler}>
            <div className="relative bg-[#006666] p-2 rounded-full">
              <AiOutlineShoppingCart size={24} color="white" />
              <span className="absolute -top-1 -right-1 rounded-full bg-[#3bc177] w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center">
                {cart.length}
              </span>
            </div>
          </button>

          {/* Wishlist */}
          <button onClick={openWishlistHandler}>
            <div className="relative bg-[#006666] p-2 rounded-full">
              <AiOutlineHeart size={24} color="white" />
              <span className="absolute -top-1 -right-1 rounded-full bg-[#3bc177] w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center">
                {wishlist.length}
              </span>
            </div>
          </button>

          {/* Profile Avatar or Login */}
          <figure>
            <div className="relative bg-[#006666] p-2 rounded-full">
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
                  <AiOutlineUser size={24} color="white" />
                </Link>
              )}
            </div>
          </figure>
        </section>
      </div>

      {/* Conditionally Rendered Cart and Wishlist */}
      {isCartOpen && <Cart cartOpenHandler={openCartHandler} />}
      {isWishlistOpen && <Wishlist wishlistOpenHandler={openWishlistHandler} />}
    </header>
  );
}

// ProfileAvatar component
type ProfileAvatarProps = {
  src?: string;
};

function ProfileAvatar({ src }: ProfileAvatarProps) {
  const imageUrl = src ? `${BASE_URL}/${src}` : "/placeholder.png";
  return (
    <img
      src={imageUrl}
      alt="profile avatar"
      className="w-[35px] h-[35px] rounded-full border bg-white"
      width={35}
    />
  );
}
