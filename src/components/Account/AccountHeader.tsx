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

  // track whether we're on desktop (md+) so we can remove the button from DOM on mobile
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("account_sidebar_pinned");
      const isPinned = stored === "true";
      document.documentElement.style.setProperty("--account-sidebar-width", isPinned ? "clamp(16rem, 18vw, 24rem)" : "clamp(5rem, 6vw, 7rem)");
      document.documentElement.style.setProperty("--account-header-height", "80px");
      setPinned(isPinned);
    } catch {}
  }, []);

  // media query listener to keep isDesktop updated
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      // MediaQueryListEvent for addEventListener 'change', MediaQueryList for older .addListener
      // both have .matches
      setIsDesktop(("matches" in e) ? e.matches : mq.matches);
    };

    // set initial
    setIsDesktop(mq.matches);

    if ("addEventListener" in mq) {
      mq.addEventListener("change", handler as EventListener);
      return () => mq.removeEventListener("change", handler as EventListener);
    } else {
      // older browsers
      // @ts-ignore
      mq.addListener(handler);
      return () => {
        // @ts-ignore
        mq.removeListener(handler);
      };
    }
  }, []);

  // toggle sidebar (desktop only)
  const toggleSidebar = () => {
    try {
      const next = !pinned;
      localStorage.setItem("account_sidebar_pinned", String(next));
      document.documentElement.style.setProperty("--account-sidebar-width", next ? "clamp(16rem, 18vw, 24rem)" : "clamp(5rem, 6vw, 7rem)");

      // notify AccountNavbar
      window.dispatchEvent(new CustomEvent("account-sidebar-change", { detail: next }));

      setPinned(next);
    } catch {
      setPinned((p) => !p);
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 left-0 right-0 z-50 px-0">
      {/* full-width row — left side (hamburger + logo) is flush to viewport edge */}
      <div className="h-[80px] w-full flex items-center justify-between">
        {/* LEFT: hamburger + logo (flush left) */}
        <div className="flex items-center gap-3 pl-4">
          {/* Render the collapse button only on desktop (removed from DOM on mobile) */}
          {isDesktop && (
            <button
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center w-10 h-10 rounded-none bg-sky-50 text-sky-700 hover:bg-sky-100 focus:outline-none"
            >
              <FaBars size={18} />
            </button>
          )}

          {/* Logo — placed immediately to the right of the hamburger, also flush */}
          <Link to="/" className="flex items-center" aria-label="Home">
            <img src="/logo.png" alt="brand-logo" width={220} className="block" />
          </Link>
        </div>

        {/* RIGHT: placeholder for future right-side items — kept empty so layout remains symmetric */}
        <div className="pr-4" />
      </div>
    </header>
  );
}
