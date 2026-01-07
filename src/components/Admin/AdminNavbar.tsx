import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { LuMessageSquare } from "react-icons/lu";
import { GrWorkshop } from "react-icons/gr";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { useUserStore } from "@/store/userStore";
import { API_URL } from "@/data";

type LinkItemProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean; // <--- allow passing `end` to NavLink
  onClick?: () => void;
};

function LinkItem({ to, label, icon, end, onClick }: LinkItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={label}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
         ${isActive ? "bg-sky-50 text-sky-700" : "text-gray-600 hover:bg-sky-50 hover:text-sky-600"}`
      }
    >
      <span className="shrink-0 text-lg">{icon}</span>

      {/* label - visually hidden when collapsed but present for screen readers */}
      <span className="label transition-opacity whitespace-nowrap">{label}</span>

      {/* tooltip shown only when fully collapsed (CSS controls visibility) */}
      <span
        className="tooltip pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden rounded-md border bg-white shadow-lg px-3 py-2 text-sm text-gray-700"
        aria-hidden="true"
      >
        {label}
      </span>
    </NavLink>
  );
}

export default function AdminNavbar() {
  const user = useUserStore((s) => s.user);
  const removeUser = useUserStore((s) => s.removeUser);

  const location = useLocation();
  const navigate = useNavigate();

  // pinned = expanded state (persisted)
  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem("admin_sidebar_pinned") === "true";
    } catch {
      return false;
    }
  });

  // mobile drawer state (unchanged)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut] = useState(false);

  // close mobile drawer on route change
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  // persist pinned state
  useEffect(() => {
    try {
      localStorage.setItem("admin_sidebar_pinned", String(pinned));
    } catch {}
  }, [pinned]);

  // keyboard escape closes mobile drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fallbackAvatar = user?.avatar ?? "/image60.png";
  const isExpanded = pinned; // only pinned controls expansion

const logoutHandler = async () => {
  console.log("Logging out admin...");
  try {
    await fetch(API_URL+"admin/logout", {
      method: "POST",
      credentials: "include", // 🔥 REQUIRED
    });
  } catch (e) {
    // even if backend fails, continue cleanup
  } finally {
    removeUser(); // Zustand + localStorage
    navigate("/admin-login", { replace: true });
  }
};


  return (
    <>
      {/* mobile header (unchanged) */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 overflow-hidden flex items-center justify-center">
              <img src={fallbackAvatar} alt="admin avatar" className="w-9 h-9 rounded-full object-cover border-2 border-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Welcome</p>
              <p className="text-sm font-medium text-gray-800">{user?.firstName || "Admin"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
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

      {/* desktop sidebar: only pinned opens it */}
      <aside
        className={`hidden md:flex flex-col sticky top-24 self-start ${isExpanded ? "w-64" : "w-20"} transition-all duration-200`}
        aria-expanded={isExpanded}
      >
        {/* ---------- small horizontal area for the hamburger button (visible on md+) ---------- */}
        <div className="hidden md:flex items-start px-3 pt-2">
          <button
            onClick={() => setPinned((p) => !p)}
            title={isExpanded ? "Collapse sidebar" : "Open sidebar"}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-white shadow-sm hover:bg-gray-100 focus:outline-none"
            aria-pressed={isExpanded}
          >
            <FaBars />
          </button>
        </div>

        {/* main sidebar card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col mt-2">
          <div className="flex items-center gap-4 p-4 border-b">
            <div
              className="flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 shrink-0"
              style={{ width: isExpanded ? 56 : 40, height: isExpanded ? 56 : 40 }}
            >
              <img
                src={fallbackAvatar}
                alt="admin avatar"
                className={`rounded-full object-cover border-2 border-white ${isExpanded ? "w-12 h-12" : "w-8 h-8"}`}
              />
            </div>

            <div className={`transition-all ${isExpanded ? "opacity-100" : "opacity-0 max-w-0 pointer-events-none"}`}>
              <p className="text-xs text-gray-400">Hello,</p>
              <p className="font-semibold text-gray-800 leading-5">{`${user?.firstName || ""} ${user?.lastName || ""}`}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            {/* chevron removed as requested */}
          </div>

          {/* nav area: vertical scroll possible but scrollbar hidden for clean UI */}
          <nav className="p-3 flex-1 overflow-y-auto nav-scrollarea">
            <div className="flex flex-col gap-1">
              {/* <-- pass `end` for Dashboard so it's only active on exact /admin */ }
              <LinkItem to="/admin" end icon={<RxDashboard />} label="Dashboard" />
              <LinkItem to="/admin/orders" icon={<GrWorkshop />} label="All Orders" />
              <LinkItem to="/admin/requests" icon={<LuMessageSquare />} label="Requests" />
              <LinkItem to="/admin/sellers" icon={<GrWorkshop />} label="All Sellers" />
              <LinkItem to="/admin/users" icon={<GrWorkshop />} label="All Institutes" />
              <LinkItem to="/admin/products" icon={<GrWorkshop />} label="All Products" />
              <LinkItem to="/admin/img-upload" icon={<GrWorkshop />} label="Image Upload" />
              <LinkItem to="/admin/bulk-order-request" icon={<GrWorkshop />} label="Bulk Order Request" />
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
              <span className={`label transition-opacity ${isExpanded ? "opacity-100" : "opacity-0 max-w-0 pointer-events-none"}`}>
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>

        {/* hide scrollbar, hide labels when collapsed, show tooltips when collapsed */}
        <style>{`
          .nav-scrollarea {
            scrollbar-width: none; /* firefox */
            -ms-overflow-style: none; /* IE 10+ */
          }
          .nav-scrollarea::-webkit-scrollbar { display: none; } /* webkit */

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

          aside[aria-expanded="false"] nav a {
            justify-content: center;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          aside[aria-expanded="false"] .group:hover .tooltip {
            display: block;
            opacity: 1;
            transform: translateX(0);
          }
          .tooltip {
            display: none;
            opacity: 0;
            transform: translateX(-6px);
            transition: transform .14s ease, opacity .14s ease;
            white-space: nowrap;
            z-index: 50;
          }
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

      {/* mobile drawer (unchanged) */}
      <div
        className={`fixed inset-0 z-40 md:hidden transform ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white shadow-2xl transform transition-transform flex flex-col ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                <img src={fallbackAvatar} alt="admin avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{`${user?.firstName || ""} ${user?.lastName || ""}`}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100">
                <FaTimes />
              </button>
            </div>
          </div>

          <nav className="p-3 overflow-auto">
            {/* also pass `end` for mobile Dashboard link */}
            <LinkItem to="/admin" end icon={<RxDashboard />} label="Dashboard" onClick={() => setDrawerOpen(false)} />
            <LinkItem to="/admin/orders" icon={<GrWorkshop />} label="All Orders" onClick={() => setDrawerOpen(false)} />
            <LinkItem to="/admin/requests" icon={<LuMessageSquare />} label="Requests" onClick={() => setDrawerOpen(false)} />
            <LinkItem to="/admin/sellers" icon={<GrWorkshop />} label="All Sellers" onClick={() => setDrawerOpen(false)} />
            <LinkItem to="/admin/users" icon={<GrWorkshop />} label="All Institutes" onClick={() => setDrawerOpen(false)} />
            <LinkItem to="/admin/products" icon={<GrWorkshop />} label="All Products" onClick={() => setDrawerOpen(false)} />
            <LinkItem to="/admin/img-upload" icon={<GrWorkshop />} label="Image Upload" onClick={() => setDrawerOpen(false)} />
            <LinkItem to="/admin/bulk-order-request" icon={<GrWorkshop />} label="Bulk Order Request" onClick={() => setDrawerOpen(false)} />


            <div className="mt-6 pt-4 px-3">
              <button
                onClick={() => {
                  setDrawerOpen(false);
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
