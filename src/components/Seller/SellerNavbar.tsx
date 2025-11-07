// src/components/Seller/SellerNavbar.tsx
import{ useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { TiDocumentAdd } from "react-icons/ti";
import { AiOutlineProduct } from "react-icons/ai";
import { CiDeliveryTruck } from "react-icons/ci";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { useSellerStore } from "@/store/sellerStore";
import { toast } from "react-toastify";
import SidebarNavlinks from "./SidebarNavlinks";

export default function SellerNavbar() {
  const seller = useSellerStore((s) => s.seller);
  const removeSeller = useSellerStore((s) => s.removeSeller);
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // close drawer on route change
  useEffect(() => setOpen(false), [location.pathname]);

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // const fallbackAvatar =  seller?.profilePic || "https://cdn-icons-png.flaticon.com/512/2922/2922510.png";
  const fallbackAvatar = seller?.profilePic
    ? `/baseUrl/${seller?.profilePic}`
    : "/image60.png";
  
  const logoutHandler = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // call your logout endpoint; keep simple here (adjust to your API)
      const res = await fetch("/api/v2/seller/logout", { method: "POST", credentials: "include" });
      if (res.ok) {
        removeSeller();
        toast.success("Logged out", { position: "top-center" });
        navigate("/", { replace: true });
        return;
      }
      // fallback: clear store anyway
      removeSeller();
      toast.info("Logged out", { position: "top-center" });
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error", err);
      toast.error("Network error while logging out", { position: "top-center" });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* --- Mobile compact header (visible only on small screens) --- */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 overflow-hidden flex items-center justify-center">
              <img src={fallbackAvatar} alt="seller avatar" className="w-9 h-9 rounded-full object-cover border-2 border-white" />
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

      {/* --- Desktop / Tablet sidebar (md+) --- */}
      <aside className="hidden md:block sticky top-24 self-start w-full max-w-[250px]">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center gap-4 p-5 border-b">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center overflow-hidden">
              <img src={fallbackAvatar} alt="seller avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Hello,</p>
              <p className="font-semibold text-gray-800 leading-4">{`${seller?.firstName || ""} ${seller?.lastName || ""}`}</p>
              <p className="text-xs text-gray-500">{seller?.email}</p>
            </div>
          </div>

          <nav className="p-3">
            <SidebarNavlinks icon={<RxDashboard />} to="/seller" end label="Dashboard" />
            <SidebarNavlinks icon={<FaRegCircleUser />} to="/seller/my-account" label="My Account" />
            <SidebarNavlinks icon={<TiDocumentAdd />} to="/seller/add-product" label="Add Product" />
            <SidebarNavlinks icon={<AiOutlineProduct />} to="/seller/products" label="All Products" />
            <SidebarNavlinks icon={<CiDeliveryTruck />} to="/seller/orders" label="All Orders" />

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
                <img src={fallbackAvatar} alt="seller avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{`${seller?.firstName || ""} ${seller?.lastName || ""}`}</p>
                <p className="text-xs text-gray-500">{seller?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
            <SidebarNavlinks icon={<RxDashboard />} to="/seller" end label="Dashboard" onClick={() => setOpen(false)} />
            <SidebarNavlinks icon={<TiDocumentAdd />} to="/seller/add-product" label="Add Product" onClick={() => setOpen(false)} />
            <SidebarNavlinks icon={<AiOutlineProduct />} to="/seller/products" label="All Products" onClick={() => setOpen(false)} />
            <SidebarNavlinks icon={<CiDeliveryTruck />} to="/seller/orders" label="All Orders" onClick={() => setOpen(false)} />

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
}
