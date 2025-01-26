import { Link } from "react-router";
import { ActionBtn, SecondryBtn } from "../UI/Buttons";
import { IoIosArrowForward } from "react-icons/io";
import { AiOutlineSearch } from "react-icons/ai";
import { Logo } from "../UI/Logo";
import { useUserStore } from "../../store/userStore";
import { useSellerStore } from "../../store/sellerStore";

export default function Header() {
  const { user, removeUser } = useUserStore((state) => state);
  const { seller, removeSeller } = useSellerStore((state) => state);

  async function logoutHandler() {
    try {
      let url = "/api/v2/user/logout";
      if (seller) {
        url = "/api/v2/shop/logout";
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("something went wrong");
      removeUser();
      removeSeller();
    } catch (err) {
      console.log(err);
    }
  }

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
      {!user && !seller ? (
        <Link to="/signup-seller">
          <ActionBtn>
            Become Seller
            <IoIosArrowForward className="ml-1" />
          </ActionBtn>
        </Link>
      ) : (
        <SecondryBtn width={100} onClick={logoutHandler}>
          <p>Logout</p>
        </SecondryBtn>
      )}
    </header>
  );
}
