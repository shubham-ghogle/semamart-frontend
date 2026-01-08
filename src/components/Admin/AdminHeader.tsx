"use client";
import { Link } from "react-router-dom";
import { CiMoneyBill } from "react-icons/ci";
import { GrWorkshop } from "react-icons/gr";
import { MdOutlineLocalOffer } from "react-icons/md";
import { FaBars } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function AdminHeader() {
  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem("admin_sidebar_pinned") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_sidebar_pinned");
      const isPinned = stored === "true";
      document.documentElement.style.setProperty(
        "--admin-sidebar-width",
        isPinned ? "16rem" : "5rem"
      );
      setPinned(isPinned);
    } catch {}
  }, []);

  const toggleSidebar = () => {
    try {
      const next = !pinned;
      localStorage.setItem("admin_sidebar_pinned", String(next));
      document.documentElement.style.setProperty(
        "--admin-sidebar-width",
        next ? "16rem" : "5rem"
      );
      window.dispatchEvent(
        new CustomEvent("admin-sidebar-change", { detail: next })
      );
      setPinned(next);
    } catch {
      setPinned((p) => !p);
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-30 px-4">
      {/* Desktop header */}
      <div className="container mx-auto h-[80px] hidden md:flex items-center justify-between">
        
        {/* LEFT SIDE: toggle + logo */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 focus:outline-none"
            title="Toggle sidebar"
          >
            <FaBars size={18} />
          </button>

          <Link to="/" target="_blank" rel="noopener noreferrer">
            <img src="/logo.png" alt="brand-logo" width={250} />
          </Link>
        </div>

        {/* RIGHT SIDE: icons */}
        <div className="flex items-center mr-4">
          <Link to="/admin-withdraw-request" className="800px:block hidden">
            <CiMoneyBill color="#555" size={30} className="mx-5 cursor-pointer" />
          </Link>
          <Link to="/admin-events" className="800px:block hidden">
            <MdOutlineLocalOffer color="#555" size={30} className="mx-5 cursor-pointer" />
          </Link>
          <Link to="/admin-sellers" className="800px:block hidden">
            <GrWorkshop color="#555" size={30} className="mx-5 cursor-pointer" />
          </Link>
        </div>
      </div>

      {/* Mobile header remains untouched inside AdminNavbar */}
    </header>
  );
}
