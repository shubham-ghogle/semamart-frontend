// src/components/Account/AccountNavbar.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaUser,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaRegHeart,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useUserStore } from "@/store/userStore";
import { useSellerStore } from "@/store/sellerStore";
import { toast } from "react-toastify";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/921/921087.png";

interface NavItemProps {
  to: string;
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, children, active, onClick }) => (
  <Link to={to} onClick={onClick} className="block">
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active ? "bg-sky-50 ring-1 ring-sky-100" : "hover:bg-sky-50"
      }`}
    >
      {children}
    </div>
  </Link>
);

const AccountNavbar: React.FC = () => {
  const { user, removeUser } = useUserStore((s) => s);
  const { seller, removeSeller } = useSellerStore((s) => s);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isSeller = !!seller;
  const isUser = !!user;

  const currentAvatar = user?.avatar ?? seller?.avatar ?? DEFAULT_AVATAR;
  const currentName = user?.firstName ?? seller?.firstName ?? "User";
  const currentEmail = user?.email ?? seller?.email ?? "";

  // --- FIX: only highlight profile when exactly on /account ---
  const isActive = (path: string) => {
    if (path === "/account") return location.pathname === "/account";
    return location.pathname.startsWith(path);
  };

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Logout logic
  async function logoutHandler() {
    if (loggingOut) return;
    setLoggingOut(true);

    const url = isSeller ? "/api/v2/shop/logout" : "/api/v2/user/logout";

    const call = async (method: "GET" | "POST") =>
      fetch(url, { method, credentials: "include" });

    try {
      let res = await call("GET");
      if (res.status === 405) res = await call("POST");

      if (res.ok) {
        removeUser();
        removeSeller();
        toast.success("Logged out successfully", { position: "top-center" });
        navigate("/", { replace: true });
        return;
      }

      if (res.status === 401 || res.status === 403) {
        removeUser();
        removeSeller();
        toast.info("Session expired — logged out locally", { position: "top-center" });
        navigate("/", { replace: true });
        return;
      }

      const msg =
        (await res.json().catch(() => null))?.message ||
        `Logout failed (status ${res.status})`;
      toast.error(msg, { position: "top-center" });
    } catch (err) {
      console.error("[logout] network error:", err);
      toast.error("Network error while logging out", { position: "top-center" });
    } finally {
      setLoggingOut(false);
    }
  }

  // Hide entire navbar if nobody logged in
  if (!isUser && !isSeller) return null;

  return (
    <>
      {/* --- Mobile Header --- */}
      <div className="md:hidden mb-3">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 overflow-hidden flex items-center justify-center">
              <img
                src={currentAvatar}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-white"
              />
            </div>
            <div>
              <p className="text-xs text-gray-400">Hello</p>
              <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                {currentName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Open account menu"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-sky-50 text-sky-600 hover:bg-sky-100"
            >
              <FaBars /> Menu
            </button>

            <button
              aria-label="Logout"
              onClick={logoutHandler}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>

      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:block sticky top-24 self-start w-full max-w-[320px]">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center gap-4 p-5 border-b">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center overflow-hidden">
              <img
                src={currentAvatar}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            </div>
            <div>
              <p className="text-xs text-gray-400">Hello,</p>
              <p className="font-semibold text-gray-800 leading-4">{currentName}</p>
              <p className="text-xs text-gray-500 truncate max-w-[180px]">{currentEmail}</p>
            </div>
          </div>

          <nav className="p-3">
            {/* Only show to USERS */}
            {!isSeller && (
              <NavItem to="/account/orders" active={isActive("/account/orders")}>
                <FaClipboardList className="text-sky-600" />
                <span className="text-sm text-gray-700">My Orders</span>
              </NavItem>
            )}

            <div className="mt-3 border-t pt-3">
              <p className="text-xs text-gray-500 px-4 mb-2">Account Settings</p>

              <NavItem to="/account" active={isActive("/account")}>
                <FaUser className="text-sky-600" />
                <span className="text-sm text-gray-700">Profile Information</span>
              </NavItem>

              {/* Only show to USERS */}
              {!isSeller && (
                <>
                  <NavItem to="/account/address" active={isActive("/account/address")}>
                    <FaMapMarkerAlt className="text-sky-600" />
                    <span className="text-sm text-gray-700">Manage Addresses</span>
                  </NavItem>

                  <NavItem to="/account/wishlist" active={isActive("/account/wishlist")}>
                    <FaRegHeart className="text-sky-600" />
                    <span className="text-sm text-gray-700">My Wishlist</span>
                  </NavItem>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 px-3">
              <button
                onClick={logoutHandler}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-sky-50 disabled:opacity-60"
              >
                <FaSignOutAlt className="text-sky-600" />{" "}
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* --- Mobile Drawer --- */}
      <div
        className={`fixed inset-0 z-40 md:hidden transform ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        <div
          className={`absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                <img
                  src={currentAvatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{currentName}</p>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">{currentEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Logout"
                onClick={() => {
                  setOpen(false);
                  logoutHandler();
                }}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60"
              >
                <FaSignOutAlt />
              </button>

              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <nav className="p-3 overflow-auto h-full">
            {/* Only show to USERS */}
            {!isSeller && (
              <NavItem
                to="/account/orders"
                active={isActive("/account/orders")}
                onClick={() => setOpen(false)}
              >
                <FaClipboardList className="text-sky-600" />
                <span className="text-sm text-gray-700">My Orders</span>
              </NavItem>
            )}

            <div className="mt-3 border-t pt-3">
              <p className="text-xs text-gray-500 px-4 mb-2">Account Settings</p>

              <NavItem to="/account" active={isActive("/account")} onClick={() => setOpen(false)}>
                <FaUser className="text-sky-600" />
                <span className="text-sm text-gray-700">Profile Information</span>
              </NavItem>

              {/* Only show to USERS */}
              {!isSeller && (
                <>
                  <NavItem
                    to="/account/address"
                    active={isActive("/account/address")}
                    onClick={() => setOpen(false)}
                  >
                    <FaMapMarkerAlt className="text-sky-600" />
                    <span className="text-sm text-gray-700">Manage Addresses</span>
                  </NavItem>

                  <NavItem
                    to="/account/wishlist"
                    active={isActive("/account/wishlist")}
                    onClick={() => setOpen(false)}
                  >
                    <FaRegHeart className="text-sky-600" />
                    <span className="text-sm text-gray-700">My Wishlist</span>
                  </NavItem>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 px-3">
              <button
                onClick={() => {
                  setOpen(false);
                  logoutHandler();
                }}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-sky-50 disabled:opacity-60"
              >
                <FaSignOutAlt className="text-sky-600" />{" "}
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default AccountNavbar;
