"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";

export default function AdminHeader() {
  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem("admin_sidebar_pinned") === "true";
    } catch {
      return false;
    }
  });

  // whether viewport is at "desktop" breakpoint (md+)
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_sidebar_pinned");
      const isPinned = stored === "true";
      // set CSS vars on root (no inline CSS vars used)
      document.documentElement.style.setProperty("--admin-sidebar-width", isPinned ? "16rem" : "5rem");
      document.documentElement.style.setProperty("--admin-header-height", "80px");
      setPinned(isPinned);
    } catch {}
  }, []);

  // media query listener to render/remove collapse button from DOM on resize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop("matches" in e ? e.matches : mq.matches);
    };
    setIsDesktop(mq.matches);
    if ("addEventListener" in mq) {
      mq.addEventListener("change", handler as EventListener);
      return () => mq.removeEventListener("change", handler as EventListener);
    } else {
      // fallback for older browsers
      // @ts-ignore
      mq.addListener(handler);
      return () => {
        // @ts-ignore
        mq.removeListener(handler);
      };
    }
  }, []);

  const toggleSidebar = () => {
    try {
      const next = !pinned;
      localStorage.setItem("admin_sidebar_pinned", String(next));
      document.documentElement.style.setProperty("--admin-sidebar-width", next ? "16rem" : "5rem");
      window.dispatchEvent(new CustomEvent("admin-sidebar-change", { detail: next }));
      setPinned(next);
    } catch {
      setPinned((p) => !p);
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-30" style={{ height: "var(--admin-header-height, 80px)" }}>
      {/* left-aligned group (extreme left) */}
      <div className="flex items-center h-full">
        <div className="flex items-center gap-3 ml-4 md:ml-4">
          {/* render collapse button only on desktop (md+) so it's removed on mobile */}
          {isDesktop && (
            <button
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center w-10 h-10 rounded-none bg-sky-50 text-sky-700 hover:bg-sky-100 focus:outline-none"
              title="Toggle sidebar"
              style={{ border: "none" }}
            >
              <FaBars size={18} />
            </button>
          )}

          <Link to="/" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <img
              src="/logo.png"
              alt="brand-logo"
              className="block"
              style={{ height: 44, width: "auto", maxWidth: 260, borderRadius: 0 }}
            />
          </Link>
        </div>

        {/* spacer to push icons (if any) to the right */}
        <div className="flex-1" />

        {/* right-side icons container (kept inside container width on large screens) */}
        <div className="hidden md:flex items-center mr-4">
          {/* user can place icons here; left group remains at extreme left */}
        </div>
      </div>

      <style>{`
        /* remove rounding for header children just in case */
        button, img { border-radius: 0 !important; }
      `}</style>
    </header>
  );
}
