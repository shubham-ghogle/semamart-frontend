// src/components/Seller/SellerNavbar.tsx

import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { TiDocumentAdd } from "react-icons/ti";
import { AiOutlineProduct } from "react-icons/ai";
import { CiDeliveryTruck } from "react-icons/ci";
import { FaBars, FaTimes, FaSignOutAlt, FaBoxOpen } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdStorefront } from "react-icons/md";
import { useSellerStore } from "@/store/sellerStore";
import { toast } from "react-toastify";
import { API_URL, BASE_URL } from "@/data";
import { TbCoinRupee } from "react-icons/tb";
import { LuContactRound, LuMessageSquare } from "react-icons/lu";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
type LinkItemProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  onClick?: () => void;
  target?: "_blank" | "_self";
  rel?: string;
  pinned?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                LINK ITEM                                   */
/* -------------------------------------------------------------------------- */

function LinkItem({
  to,
  label,
  icon,
  end,
  onClick,
  target,
  rel,
  pinned = true,
}: LinkItemProps) {
  const collapsed = !pinned;

  // adjust spacing/justification when collapsed so only icon is visible
  const baseClasses = [
    "group",
    "relative",
    "flex",
    "items-center",
    collapsed ? "justify-center" : "gap-3",
    "rounded-md",
    collapsed ? "px-0 py-2" : "px-3 py-2",
    "text-sm",
    "font-medium",
    "transition-colors",
  ].join(" ");

  const linkVisualClasses = (isActive: boolean) =>
    `${baseClasses} ${
      isActive
        ? "bg-sky-50 text-sky-700"
        : "text-gray-600 hover:bg-sky-50 hover:text-sky-600"
    }`;

  const tooltipCommon =
    "pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 rounded-md border bg-white shadow-lg px-3 py-2 text-sm text-gray-700";

  if (target === "_blank") {
    return (
      <a
        href={to}
        target="_blank"
        rel={rel ?? "noopener noreferrer"}
        title={label}
        onClick={onClick}
        className={`${baseClasses} text-gray-600 hover:bg-sky-50 hover:text-sky-600`}
      >
        <span className="shrink-0 text-lg">{icon}</span>

        {/* only render label when expanded (pinned) */}
        {pinned && (
          <span className="label transition-opacity whitespace-nowrap">{label}</span>
        )}

        {/* tooltip: only used in collapsed state and shown on hover */}
        <span
          className={`hidden group-hover:block ${tooltipCommon}`}
          aria-hidden="true"
          style={{ display: collapsed ? undefined : "none" }}
        >
          {label}
        </span>
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={label}
      className={({ isActive }) => linkVisualClasses(isActive)}
    >
      <span className="shrink-0 text-lg">{icon}</span>

      {/* only render label when expanded (pinned) */}
      {pinned && (
        <span className="label transition-opacity whitespace-nowrap">{label}</span>
      )}

      {/* tooltip: only used in collapsed state and shown on hover */}
      <span
        className={`hidden group-hover:block ${tooltipCommon}`}
        aria-hidden="true"
        style={{ display: collapsed ? undefined : "none" }}
      >
        {label}
      </span>
    </NavLink>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SELLER NAVBAR                                 */
/* -------------------------------------------------------------------------- */


export default function SellerNavbar() {
  const seller = useSellerStore((s) => s.seller);
  const removeSeller = useSellerStore((s) => s.removeSeller);
  const location = useLocation();
  const navigate = useNavigate();

  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem("seller_sidebar_pinned") === "true";
    } catch {
      return true;
    }
  });

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    try {
      document.documentElement.style.setProperty(
        "--seller-sidebar-width",
        pinned ? "250px" : "80px"
      );
    } catch {}
  }, [pinned]);

  useEffect(() => {
    const onSidebarChange = (e: Event) => {
      const ev = e as CustomEvent<boolean>;
      if (typeof ev.detail === "boolean") {
        setPinned(ev.detail);
      } else {
        try {
          setPinned(localStorage.getItem("seller_sidebar_pinned") === "true");
        } catch {}
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "seller_sidebar_pinned") {
        setPinned(e.newValue === "true");
      }
    };

    window.addEventListener("seller-sidebar-change", onSidebarChange as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("seller-sidebar-change", onSidebarChange as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fallbackAvatar = seller?.profilePic
    ? `${BASE_URL}images/${seller.profilePic}`
    : "/image60.png";

  const logoutHandler = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // Attempt API logout, but don't fail if it fails
      try {
        await fetch(API_URL + "shop/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (apiErr) {
        console.error("API logout failed:", apiErr);
        // Continue with local logout even if API fails
      }

      removeSeller();
      toast.success("Logged out", { position: "top-center" });
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Network error while logging out", { position: "top-center" });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* ----------------------------- MOBILE HEADER ----------------------------- */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 overflow-hidden flex items-center justify-center">
              <img
                src={fallbackAvatar}
                alt="seller avatar"
                className=" rounded-full object-cover "
              />
            </div>
            <div>
              <p className="text-xs text-gray-400">Welcome</p>
              <p className="text-sm font-medium text-gray-800">{seller?.firstName || "Seller"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Open menu"
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

      {/* ----------------------------- DESKTOP SIDEBAR ----------------------------- */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-[80px] bottom-0 z-30 bg-white shadow-md transition-all duration-200 ${
          pinned ? "w-[250px]" : "w-[80px]"
        }`}
        aria-expanded={pinned}
      >
        <div className="bg-white rounded-r-xl overflow-hidden h-full flex flex-col">
          <div className="flex items-center gap-4 p-4 border-b">
            <div
              className="flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 shrink-0"
              style={{ width: pinned ? 56 : 40, height: pinned ? 56 : 40 }}
            >
              <img
                src={fallbackAvatar}
                alt="seller avatar"
                className={`rounded-full object-cover ${pinned ? "" : "w-8 h-8"}`}
              />
            </div>

            <div
              className={`transition-all ${pinned ? "opacity-100" : "opacity-0 max-w-0 pointer-events-none"}`}
            >
              <p className="text-xs text-gray-400">Hello,</p>
              <p className="font-semibold text-gray-800 leading-5">
                {`${seller?.firstName || ""} ${seller?.lastName || ""}`}
              </p>
              <p className="text-xs text-gray-500">{seller?.email}</p>
            </div>
          </div>

          {/* nav area */}
          <nav className="p-3 flex-1 overflow-y-auto nav-scrollarea">
            <div className="h-full flex flex-col">
              <div className="flex flex-col gap-1">
                <LinkItem to="/seller" end icon={<RxDashboard />} label="Dashboard" pinned={pinned} />
                <LinkItem to="/seller/my-account" icon={<FaRegCircleUser />} label="My Account" pinned={pinned} />
                <LinkItem to="/seller/add-product" icon={<TiDocumentAdd />} label="Add Product" pinned={pinned} />
                <LinkItem to="/seller/products" icon={<AiOutlineProduct />} label="All Products" pinned={pinned} />
                <LinkItem to="/seller/orders" end icon={<CiDeliveryTruck />} label="All Orders" pinned={pinned} />
                <LinkItem to="/seller/orders/delivered" icon={<TbCoinRupee />} label="Total Sales" pinned={pinned} />
                <LinkItem to="/seller/support" icon={<LuMessageSquare />} label="Support" pinned={pinned} />
                <LinkItem to="/seller/stock-management" icon={<FaBoxOpen />} label="Stock Management" pinned={pinned} />
                <LinkItem to={`/shop/${seller?._id}`} icon={<MdStorefront />} label="My Shop" target="_blank" pinned={pinned} />
              </div>
              <div className="mt-auto pt-3 border-t">
                <LinkItem to="/seller/contact-us" icon={<LuContactRound />} label="Contact Us" pinned={pinned} />
              </div>
            </div>
          </nav>

          <div className="p-3 border-t">
            <button
              onClick={logoutHandler}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-sky-50 disabled:opacity-60"
              title="Logout"
            >
              <FaSignOutAlt className="text-sky-600" />
              {/* hide label when collapsed */}
              {pinned && (
                <span className="label transition-opacity">
                  {loggingOut ? "Logging out..." : "Logout"}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ----------------------------- MOBILE DRAWER ----------------------------- */}
      <div
        className={`fixed inset-0 z-40 md:hidden transform ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
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
                  src={fallbackAvatar}
                  alt="seller avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 "
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {`${seller?.firstName || ""} ${seller?.lastName || ""}`}
                </p>
                <p className="text-xs text-gray-500">{seller?.email}</p>
              </div>
            </div>

            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
            >
              <FaTimes />
            </button>
          </div>

          <nav className="p-3 overflow-auto flex-1">
            <div className="h-full flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <NavLink
                  to="/seller"
                  end
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-sky-50"
                >
                  <RxDashboard />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/seller/my-account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-sky-50"
                >
                  <FaRegCircleUser />
                  <span>My Account</span>
                </NavLink>
                <NavLink
                  to="/seller/add-product"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-sky-50"
                >
                  <TiDocumentAdd />
                  <span>Add Product</span>
                </NavLink>
                <NavLink
                  to="/seller/products"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-sky-50"
                >
                  <AiOutlineProduct />
                  <span>All Products</span>
                </NavLink>
                <NavLink
                  to="/seller/orders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-sky-50"
                >
                  <CiDeliveryTruck />
                  <span>All Orders</span>
                </NavLink>
                <NavLink
                  to="/seller/stock-management"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-sky-50"
                >
                  <FaBoxOpen />
                  <span>Stock Management</span>
                </NavLink>
                <NavLink
                  to="/seller/support"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-sky-50"
                >
                  <LuMessageSquare />
                  <span>Support</span>
                </NavLink>
                <a
                  href={`/shop/${seller?._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-sky-50"
                >
                  <MdStorefront />
                  <span>My Shop</span>
                </a>
              </div>

              <div className="mt-auto pt-4 border-t">
                <NavLink
                  to="/seller/contact-us"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-sky-50"
                >
                  <LuContactRound />
                  <span>Contact Us</span>
                </NavLink>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    logoutHandler();
                  }}
                  disabled={loggingOut}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-md hover:bg-sky-50"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
