import { useUserStore } from "@/store/userStore";
import {
  FaClipboardList,
  FaUser,
  FaWallet,
  FaTags,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";


const AccountNavbar = () => {
  const { user } = useUserStore((state) => state);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  return (
    <div className="font-montserrat  mx-auto min-h-screen bg-gray-100 p-6">
      {/* User Info */}
      <div className="flex items-center bg-white p-4 shadow-md w-64">
        <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center mr-4">
          {/* Placeholder avatar illustration */}
          <div className="w-7 h-7 bg-[url('https://cdn-icons-png.flaticon.com/512/921/921087.png')] bg-cover bg-center" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Hello,</p>
          <p className="text-base font-semibold text-black">{user?.firstName}</p>
        </div>
      </div>

      {/* Sidebar Menu */}
      <div className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between mt-2 ">
        <nav>
          {/* MY ORDERS */}
         <Link to="/account/orders">
          <div className="mb-4 pb-4 border-b flex justify-between items-center cursor-pointer">
            <h3 className="font-semibold flex items-center gap-2 hover:text-blue-500 text-gray-500 cursor-pointer">
              <FaClipboardList  className="text-blue-500"/> MY ORDERS
            </h3>
            <FiChevronRight className="text-gray-500" />
          </div>
        </Link>

          {/* ACCOUNT SETTINGS */}
          <div className="mb-4 pb-4 border-b">
            <h3 className="font-semibold text-gray-500 flex items-center gap-2">
              <FaUser className="text-blue-500" /> ACCOUNT SETTINGS
            </h3>
            <ul className="ml-4 space-y-1 mt-2">
              <Link to="/account">
                <li className={`p-2 ${isActive("/account") ? "bg-blue-100 text-blue-500" : ""}`}>
                  Profile Information
                </li>
              </Link>
              <Link to="/account/address">
                <li className={`p-2 ${isActive("/account/address") ? "bg-blue-100 text-blue-500" : ""}`}>
                  Manage Addresses
                </li>
              </Link>
              <Link to="/account/pan-card-information">
                <li className={`p-2 ${isActive("/account/pan-card-information") ? "bg-blue-100 text-blue-500" : ""}`}>
                  PAN Card Information
                </li>
              </Link>
              
            </ul>

          </div>

          {/* PAYMENTS */}
          <div className="mb-4 pb-4 border-b">
            <h3 className="font-semibold text-gray-500 flex items-center gap-2">
              <FaWallet className="text-blue-500" /> PAYMENTS
            </h3>
            <ul className="ml-4 space-y-1 mt-2">
              <li className="flex justify-between items-center hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <div className=" items-center gap-2 ">
                   Gift Cards
                </div>
                <span className="text-green-600 font-bold mr-5">₹10</span>
              </li>
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2">
                   Saved UPI
                </span> 
              </li>
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2">
                   Saved Cards
                </span>
              </li>
            </ul>
          </div>

          {/* MY STUFF */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-500 flex items-center gap-2">
              <FaTags className="text-blue-500" /> MY STUFF
            </h3>
            <ul className="ml-4 space-y-1 mt-2 ">
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2 ">
                  My Coupons
                </span>
              </li>
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2">
                  My Reviews & Ratings
                </span>
              </li>
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2">
                   All Notifications
                </span>
              </li>
              <Link to="/account/wishlist">
                <li className={`p-2 ${isActive("/account/wishlist") ? "bg-blue-100 text-blue-500" : ""}`}>
                  My Wishlist
                </li>
              </Link>
            </ul>
          </div>

          {/* LOGOUT */}
          <div className="mt-6 border-t pt-4">
            <button className="flex items-center gap-2 hover:text-blue-500 text-gray-500 cursor-pointer font-medium">
              <FaSignOutAlt className="text-blue-500" /> Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};




export default AccountNavbar;
