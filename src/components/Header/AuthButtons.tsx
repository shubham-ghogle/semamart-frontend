import { Link, useNavigate } from "react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { FaRegCircleUser } from "react-icons/fa6";
import { AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai";
import { RiShoppingBag4Line } from "react-icons/ri";
import { MdOutlineSupportAgent } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import { Button } from "../ui/button";
import { UserCircle  } from "lucide-react";

type UserProfileButtonProps = {
  username: string;
  onLogout: () => void;
};
export function UserProfileButton({
  username,
  onLogout,
}: UserProfileButtonProps) {
  return (
    <NavigationMenu>
      <NavigationMenuItem>
        <NavigationMenuTrigger className="space-x-2 cursor-pointer rounded-full bg-white! text-lg capitalize font-medium text-custom-blue! hover:bg-custom-blue! hover:text-white!">
          <FaRegCircleUser size={24} />
          <span className="font-normal">{username}</span>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-44 text-lg list-none">
            <li>
              <Link
                to="/account"
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100"
              >
                <FaRegCircleUser size={20} />
                <span>My Account</span>
              </Link>
            </li>
            <li>
              <Link
                to="/wishlist"
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100"
              >
                <AiOutlineHeart size={20} />
                <span>Wishlist</span>
              </Link>
            </li>
            <li>
              <Link
                to="/add-to-cart"
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100"
              >
                <AiOutlineShoppingCart size={20} />
                <span>Cart</span>
              </Link>
            </li>
            <li>
              <Link
                to="/account/orders"
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100"
              >
                <RiShoppingBag4Line size={20} />
                <span>My Orders</span>
              </Link>
            </li>
            <li>
              <Link
                to="/support"
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100"
              >
                <MdOutlineSupportAgent size={20} />
                <span>Support</span>
              </Link>
            </li>
            <li>
              <button
                onClick={onLogout}
                className="flex items-center gap-4 px-5 py-3 w-full text-red-600 hover:bg-gray-100"
              >
                <FaSignOutAlt size={20} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenu>
  );
}

type SellerProfileButtonProps = {
  sellerName: string;
};
export function SellerProfileButton({ sellerName }: SellerProfileButtonProps) {
  const n  = useNavigate()
  return (
    <Button
      variant="ghost"
      className="px-5 py-2 rounded-full font-normal text-custom-blue flex items-center gap-2 hover:text-white hover:bg-custom-blue"
      onClick={()=>n("/seller")}
    >
      <UserCircle className="h-6! w-6!" />
      <span className="capitalize text-lg">{sellerName}</span>
    </Button>
  );
}
