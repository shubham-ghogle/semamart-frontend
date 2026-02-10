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
  FaLayerGroup,
  FaHeadset,
} from "react-icons/fa";
import {  } from "react-icons/fa";

import { useUserStore } from "@/store/userStore";
import { useSellerStore } from "@/store/sellerStore";
import { toast } from "react-toastify";
import { API_URL } from "@/data";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/921/921087.png";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, onClick }) => {
  return (
    <Link to={to} onClick={onClick} className="block">
      <div
        className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          active ? "bg-sky-50 ring-1 ring-sky-100" : "hover:bg-sky-50"
        }`}
      >
        <div className="shrink-0 text-sky-600 text-lg">{icon}</div>
        <span className="label text-sm text-gray-700 transition-opacity whitespace-nowrap">{label}</span>
      </div>
    </Link>
  );
};

const AccountNavbar: React.FC = () => {
  const { user, removeUser } = useUserStore((s) => s);
  const { seller, removeSeller } = useSellerStore((s) => s);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isSeller = !!seller;
  const isUser = !!user;

  // pinned (desktop) — read from localStorage
  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem("account_sidebar_pinned") === "true";
    } catch {
      return true;
    }
  });

  // keep CSS var in sync on mount + when pinned changes
  useEffect(() => {
    try {
      document.documentElement.style.setProperty("--account-sidebar-width", pinned ? "320px" : "80px");
    } catch {}
  }, [pinned]);

  // listen for header toggles + storage changes so header <-> navbar remain synced
  useEffect(() => {
    const onSidebarChange = (e: Event) => {
      const ev = e as CustomEvent<boolean>;
      if (typeof ev.detail === "boolean") {
        setPinned(ev.detail);
      } else {
        try {
          setPinned(localStorage.getItem("account_sidebar_pinned") === "true");
        } catch {}
      }
    };
    window.addEventListener("account-sidebar-change", onSidebarChange as EventListener);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "account_sidebar_pinned") setPinned(e.newValue === "true");
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("account-sidebar-change", onSidebarChange as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Close on Escape (mobile)
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

  const currentAvatar = user?.avatar ?? seller?.avatar ?? DEFAULT_AVATAR;
  const currentName = user?.firstName ?? seller?.firstName ?? "User";
  const currentEmail = user?.email ?? seller?.email ?? "";

  // Logout logic
  async function logoutHandler() {
    if (loggingOut) return;
    setLoggingOut(true);
    const url = API_URL + (isSeller ? "shop/logout" : "user/logout");
    try {
      const res = await fetch(url, { method: "GET", credentials: "include" });
      if (!res.ok) {
        // try POST fallback
        await fetch(url, { method: "POST", credentials: "include" }).catch(() => {});
      }
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      removeUser();
      removeSeller();
      toast.info("Logged out", { position: "top-center" });
      navigate("/", { replace: true });
      setLoggingOut(false);
    }
  }

  // Hide entire navbar if nobody logged in
  if (!isUser && !isSeller) return null;

  // Helper to detect active path
  const isActive = (path: string) => {
    if (path === "/account") return location.pathname === "/account";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* --- Mobile compact header (now aligned with Seller styles) --- */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 overflow-hidden flex items-center justify-center">
              <img src={currentAvatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Welcome</p>
              <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{currentName}</p>
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

      {/* --- Desktop Sidebar (unchanged) --- */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-[80px] bottom-0 z-40 bg-white shadow-md transition-all duration-200 ${
          pinned ? "w-[320px]" : "w-[80px]"
        }`}
        aria-expanded={pinned}
      >
        <div className="bg-white rounded-r-xl overflow-hidden h-full flex flex-col">
          <div className="flex items-center gap-4 p-5 border-b">
            <div
              className="flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 shrink-0"
              style={{ width: pinned ? 56 : 40, height: pinned ? 56 : 40 }}
            >
              <img src={currentAvatar} alt="avatar" className={`rounded-full object-cover border-2 border-white ${pinned ? "w-12 h-12" : "w-8 h-8"}`} />
            </div>

            <div className={`transition-all ${pinned ? "opacity-100" : "opacity-0 max-w-0 pointer-events-none"}`}>
              <p className="text-xs text-gray-400">Hello,</p>
              <p className="font-semibold text-gray-800 leading-4">{currentName}</p>
              <p className="text-xs text-gray-500 truncate max-w-[180px]">{currentEmail}</p>
            </div>
          </div>

          <nav className="p-3 flex-1 overflow-y-auto nav-scrollarea">
            {!isSeller && <NavItem to="/account/orders" icon={<FaClipboardList />} label="My Orders" active={isActive("/account/orders")} />}
            <div className="mt-3 border-t pt-3">
              <p className={`text-xs text-gray-500 px-4 mb-2 ${pinned ? "" : "opacity-0 pointer-events-none"}`}>Account Settings</p>
              <NavItem to="/account" icon={<FaUser />} label="Profile Information" active={isActive("/account")} />
              {!isSeller && (
                <>
                  <NavItem to="/account/address" icon={<FaMapMarkerAlt />} label="Manage Addresses" active={isActive("/account/address")} />
                  <NavItem to="/account/wishlist" icon={<FaRegHeart />} label="My Wishlist" active={isActive("/account/wishlist")} />
                  <NavItem to="/account/mybulkorder-request" icon={<FaLayerGroup />} label="Bulkorder Request" active={isActive("/account/mybulkorder-request")} />
                  <NavItem to="/user/support" icon={<FaHeadset />} label="Support" active={isActive("/user/support")} />
                </>
              )}
            </div>
          </nav>

          <div className="p-3 border-t">
            <button onClick={logoutHandler} disabled={loggingOut} className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-sky-50 disabled:opacity-60">
              <FaSignOutAlt className="text-sky-600" />
              <span className={`label transition-opacity ${pinned ? "opacity-100" : "opacity-0 max-w-0 pointer-events-none"}`}>{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>

        <style>{`
          .nav-scrollarea { scrollbar-width: none; -ms-overflow-style: none; }
          .nav-scrollarea::-webkit-scrollbar { display: none; }

          aside[aria-expanded="false"] .label {
            opacity: 0;
            width: 0;
            max-width: 0;
            pointer-events: none;
            transform: translateX(-6px);
            transition: all .18s ease;
          }
          aside[aria-expanded="true"] .label {
            opacity: 1;
            width: auto;
            max-width: 100%;
            transform: translateX(0);
            transition: all .18s ease;
          }

          aside[aria-expanded="false"] nav a { justify-content: center; padding-left: 0.5rem; padding-right: 0.5rem; }

          aside[aria-expanded="false"] .group:hover .tooltip {
            display: block;
            opacity: 1;
            transform: translateX(0);
          }
          .tooltip { display: none; opacity: 0; transform: translateX(-6px); transition: transform .14s ease, opacity .14s ease; white-space: nowrap; z-index: 50; }
          aside[aria-expanded="false"] .group:hover .tooltip::before {
            content: "";
            position: absolute;
            left: -6px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 6px;
            border-style: solid;
            border-color: transparent #ffffff transparent transparent;
            filter: drop-shadow(-1px 0 0 rgba(0,0,0,0.03));
          }
        `}</style>
      </aside>

      {/* --- Mobile drawer (adjusted to match Seller's layout/spacing) --- */}
      <div className={`fixed inset-0 z-40 md:hidden transform ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <div className={`absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`} role="dialog" aria-modal="true">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                <img src={currentAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{currentName}</p>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">{currentEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button aria-label="Logout" onClick={() => { setOpen(false); logoutHandler(); }} disabled={loggingOut} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60">
                <FaSignOutAlt />
              </button>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100">
                <FaTimes />
              </button>
            </div>
          </div>

          <nav className="p-3 overflow-auto h-full">
            {!isSeller && <NavItem to="/account/orders" icon={<FaClipboardList />} label="My Orders" active={isActive("/account/orders")} onClick={() => setOpen(false)} />}
            <div className="mt-3 border-t pt-3">
              <p className="text-xs text-gray-500 px-4 mb-2">Account Settings</p>
              <NavItem to="/account" icon={<FaUser />} label="Profile Information" active={isActive("/account")} onClick={() => setOpen(false)} />
              {!isSeller && (
                <>
                  <NavItem to="/account/address" icon={<FaMapMarkerAlt />} label="Manage Addresses" active={isActive("/account/address")} onClick={() => setOpen(false)} />
                  <NavItem to="/account/wishlist" icon={<FaRegHeart />} label="My Wishlist" active={isActive("/account/wishlist")} onClick={() => setOpen(false)} />
                  <NavItem to="/user/support" icon={<FaHeadset />} label="Support" active={isActive("/user/support")} onClick={() => setOpen(false)} />
                </>
              )}
            </div>

            <div className="mt-6 pt-4 px-3">
              <button onClick={() => { setOpen(false); logoutHandler(); }} disabled={loggingOut} className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-sky-50 disabled:opacity-60">
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
