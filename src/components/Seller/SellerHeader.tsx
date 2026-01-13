"use client";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useSellerStore } from "../../store/sellerStore";

export default function SellerHeader() {
  const { seller } = useSellerStore((state) => state);

  // desktop pinned state (read from localStorage)
  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem("seller_sidebar_pinned") === "true";
    } catch {
      return true;
    }
  });

  // sync CSS var on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("seller_sidebar_pinned");
      const isPinned = stored === "true";
      document.documentElement.style.setProperty("--seller-sidebar-width", isPinned ? "250px" : "80px");
      setPinned(isPinned);
    } catch {}
  }, []);

  // toggle (desktop) — writes to localStorage, updates CSS var and notifies listeners
  const toggleSidebar = () => {
    try {
      const next = !pinned;
      localStorage.setItem("seller_sidebar_pinned", String(next));
      document.documentElement.style.setProperty("--seller-sidebar-width", next ? "250px" : "80px");
      window.dispatchEvent(new CustomEvent("seller-sidebar-change", { detail: next }));
      setPinned(next);
    } catch {
      setPinned((p) => !p);
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 left-0 z-30 px-4">
      {/* Desktop header (md+) shows toggle at left, logo and seller/business name on right */}
      <div className="container mx-auto h-[80px] hidden md:flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* keep the hamburger icon the same for open/close (as requested) */}
          <button
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 focus:outline-none"
            title="Toggle sidebar"
          >
            <FaBars size={18} />
          </button>

          <Link to="/" target="_blank" rel="noopener noreferrer">
            <img src="/logo.png" alt="brand-logo" width={220} />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* show business name (keeps header tidy) */}
          <div className="hidden sm:block text-sm text-gray-700">{seller?.businessName}</div>
        </div>
      </div>

      {/* NOTE: mobile header (compact) is intentionally preserved inside SellerNavbar (unchanged) */}
    </header>
  );
}
