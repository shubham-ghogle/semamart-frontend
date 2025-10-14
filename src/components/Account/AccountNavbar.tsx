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

const NavItem: React.FC<{ to: string; active: boolean; onClick?: () => void } & { children: React.ReactNode }> = ({
  to,
  children,
  active,
  onClick,
}) => (
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
  const isActive = (path: string) => location.pathname === path;

  const [open, setOpen] = useState(false); // mobile drawer
  const [loggingOut, setLoggingOut] = useState(false);

  // close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close drawer on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // logout handler: picks user vs seller endpoint, calls API, clears store and redirects
async function logoutHandler() {
  if (loggingOut) return;
  setLoggingOut(true);

  const url = seller ? "/api/v2/shop/logout" : "/api/v2/user/logout";

  // helper that does a fetch with the given method but WITHOUT forcing Content-Type header
  const call = async (method: "GET" | "POST") =>
    fetch(url, {
      method,
      credentials: "include", // important for cookie/session auth
      // NOTE: do NOT set "Content-Type": "application/json" unless your server expects a JSON body.
    });

  try {
    // Try GET first (this matched your working handler)
    let res = await call("GET");
    console.debug("[logout] GET", res.status, res.statusText);

    // If server explicitly forbids GET (405) try POST as fallback
    if (res.status === 405) {
      console.debug("[logout] GET returned 405 -> retrying POST");
      res = await call("POST");
      console.debug("[logout] POST", res.status, res.statusText);
    }

    // success
    if (res.ok) {
      removeUser();
      removeSeller();
      toast.success("Logged out successfully", { position: "top-center" });
      setOpen(false);
      navigate("/", { replace: true });
      return;
    }

    // treat 401/403 as session invalid — clear local store anyway
    if (res.status === 401 || res.status === 403) {
      removeUser();
      removeSeller();
      toast.info("Session expired — logged out locally", { position: "top-center" });
      setOpen(false);
      navigate("/", { replace: true });
      return;
    }

    // Try to extract message from body (JSON or text)
    let bodyMsg: string | null = null;
    try {
      const json = await res.json();
      bodyMsg = json?.message || json?.error || null;
    } catch {
      try {
        bodyMsg = await res.text();
      } catch {
        bodyMsg = null;
      }
    }

    const msg = bodyMsg || `Logout failed (status ${res.status})`;
    console.warn("[logout] failure:", { status: res.status, message: msg });
    toast.error(msg, { position: "top-center" });
  } catch (err) {
    console.error("[logout] network error:", err);
    toast.error("Network error while logging out", { position: "top-center" });
  } finally {
    setLoggingOut(false);
  }
}


  return (
    <>
      {/* --- Mobile compact header (visible only on small screens) --- */}
      <div className="md:hidden mb-3">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 overflow-hidden flex items-center justify-center">
              <img
                src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/921/921087.png"}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-white"
              />
            </div>
            <div>
              <p className="text-xs text-gray-400">Hello</p>
              <p className="text-sm font-medium text-gray-800">{user?.firstName || "User"}</p>
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
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-red-50 text-red-600 hover:bg-red-100"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>

      {/* --- Desktop / Tablet sidebar (md+) --- */}
      <aside className="hidden md:block sticky top-24 self-start w-full max-w-[320px]">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center gap-4 p-5 border-b">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center overflow-hidden">
              <img
                src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/921/921087.png"}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            </div>
            <div>
              <p className="text-xs text-gray-400">Hello,</p>
              <p className="font-semibold text-gray-800 leading-4">{user?.firstName || "User"}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <nav className="p-3">
            <NavItem to="/account/orders" active={isActive("/account/orders")}>
              <FaClipboardList className="text-sky-600" />
              <span className="text-sm text-gray-700">My Orders</span>
            </NavItem>

            <div className="mt-3 border-t pt-3">
              <p className="text-xs text-gray-500 px-4 mb-2">Account Settings</p>

              <NavItem to="/account" active={isActive("/account")}>
                <FaUser className="text-sky-600" />
                <span className="text-sm text-gray-700">Profile Information</span>
              </NavItem>

              <NavItem to="/account/address" active={isActive("/account/address")}>
                <FaMapMarkerAlt className="text-sky-600" />
                <span className="text-sm text-gray-700">Manage Addresses</span>
              </NavItem>

              <NavItem to="/account/wishlist" active={isActive("/account/wishlist")}>
                <FaRegHeart className="text-sky-600" />
                <span className="text-sm text-gray-700">My Wishlist</span>
              </NavItem>
            </div>

            <div className="mt-6 pt-4 px-3">
              <button
                onClick={logoutHandler}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-sky-50 disabled:opacity-60"
                title="Logout"
              >
                <FaSignOutAlt className="text-sky-600" /> {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* --- Mobile slide-over drawer --- */}
      <div
        className={`fixed inset-0 z-40 md:hidden transform ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />

        {/* drawer */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white shadow-2xl transform transition-transform flex flex-col ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                <img
                  src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/921/921087.png"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user?.firstName || "User"}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Logout"
                onClick={() => {
                  // close drawer then logout (so UX stays consistent)
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

          <nav className="p-3 overflow-auto">
            <NavItem to="/account/orders" active={isActive("/account/orders")} onClick={() => setOpen(false)}>
              <FaClipboardList className="text-sky-600" />
              <span className="text-sm text-gray-700">My Orders</span>
            </NavItem>

            <div className="mt-3 border-t pt-3">
              <p className="text-xs text-gray-500 px-4 mb-2">Account Settings</p>

              <NavItem to="/account" active={isActive("/account")} onClick={() => setOpen(false)}>
                <FaUser className="text-sky-600" />
                <span className="text-sm text-gray-700">Profile Information</span>
              </NavItem>

              <NavItem to="/account/address" active={isActive("/account/address")} onClick={() => setOpen(false)}>
                <FaMapMarkerAlt className="text-sky-600" />
                <span className="text-sm text-gray-700">Manage Addresses</span>
              </NavItem>

              <NavItem to="/account/wishlist" active={isActive("/account/wishlist")} onClick={() => setOpen(false)}>
                <FaRegHeart className="text-sky-600" />
                <span className="text-sm text-gray-700">My Wishlist</span>
              </NavItem>
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
                <FaSignOutAlt className="text-sky-600" /> {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default AccountNavbar;
