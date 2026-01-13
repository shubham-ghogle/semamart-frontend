"use client";

import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function AccountHeader() {
  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem("account_sidebar_pinned") === "true";
    } catch {
      return true;
    }
  });

  // sync CSS var on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("account_sidebar_pinned");
      const isPinned = stored === "true";
      document.documentElement.style.setProperty(
        "--account-sidebar-width",
        isPinned ? "320px" : "80px"
      );
      setPinned(isPinned);
    } catch {}
  }, []);

  // toggle sidebar (desktop only)
  const toggleSidebar = () => {
    try {
      const next = !pinned;
      localStorage.setItem("account_sidebar_pinned", String(next));
      document.documentElement.style.setProperty(
        "--account-sidebar-width",
        next ? "320px" : "80px"
      );

      // notify AccountNavbar
      window.dispatchEvent(
        new CustomEvent("account-sidebar-change", { detail: next })
      );

      setPinned(next);
    } catch {
      setPinned((p) => !p);
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50 px-4">
      <div className="container mx-auto h-[80px] flex items-center gap-4">
        {/* Collapse toggle (desktop only) */}
        <button
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100"
        >
          <FaBars size={18} />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="brand-logo" width={220} />
        </Link>
      </div>
    </header>
  );
}
