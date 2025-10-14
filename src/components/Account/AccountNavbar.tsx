import { useUserStore } from "@/store/userStore";
import { useSellerStore } from "@/store/sellerStore"; // ✅ Added
import {
  FaClipboardList,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import { FiChevronRight } from "react-icons/fi";

const AccountNavbar = () => {
  const { user, removeUser } = useUserStore((state) => state);
  const { seller, removeSeller } = useSellerStore((s) => s); // ✅ Added seller store
  const location = useLocation();
  const navigate = useNavigate(); // ✅ Added navigation hook

  const isActive = (path: string) => location.pathname === path;

  // ✅ Added logout function (matches Header behavior)
  async function logoutHandler() {
    try {
      const url = seller ? "/api/v2/shop/logout" : "/api/v2/user/logout";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Something went wrong");

      removeUser();
      removeSeller();

      // redirect to homepage
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <div className="font-montserrat mx-auto min-h-screen bg-gray-100 p-6">
      {/* User Info */}
      <div className="flex items-center bg-white p-4 shadow-md w-64 rounded-xl rounded-r-3xl">
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
      <div className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between mt-2 rounded-xl">
        <nav>
          {/* MY ORDERS */}
          <Link to="/account/orders">
            <div className="mb-4 pb-4 border-b flex justify-between items-center cursor-pointer">
              <h3 className="font-semibold flex items-center gap-2 hover:text-blue-500 text-gray-500 cursor-pointer">
                <FaClipboardList className="text-blue-500" /> MY ORDERS
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
                <li
                  className={`p-2 ${
                    isActive("/account") ? "bg-blue-100 text-blue-500" : ""
                  }`}
                >
                  Profile Information
                </li>
              </Link>
              <Link to="/account/address">
                <li
                  className={`p-2 ${
                    isActive("/account/address") ? "bg-blue-100 text-blue-500" : ""
                  }`}
                >
                  Manage Addresses
                </li>
              </Link>
            </ul>
          </div>

          {/* LOGOUT */}
          <div className="mt-6 pt-4">
            <button
              onClick={logoutHandler} // ✅ Functional logout
              className="flex items-center gap-2 hover:text-blue-500 text-gray-500 cursor-pointer font-medium"
            >
              <FaSignOutAlt className="text-blue-500" /> Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AccountNavbar;
