"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { useSellerStore } from "@/store/sellerStore";

export default function SellerHeader() {
  const { seller } = useSellerStore((state) => state);

  // desktop pinned state
  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem("seller_sidebar_pinned") === "true";
    } catch {
      return true;
    }
  });

  // track desktop viewport (md+)
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : false
  );

  // sync CSS vars on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("seller_sidebar_pinned");
      const isPinned = stored === "true";

      document.documentElement.style.setProperty(
        "--seller-sidebar-width",
        isPinned
          ? "clamp(16rem, 18vw, 24rem)"
          : "clamp(5rem, 6vw, 7rem)"
      );
      document.documentElement.style.setProperty(
        "--seller-header-height",
        "80px"
      );

      setPinned(isPinned);
    } catch {}
  }, []);

  // listen for screen resize (remove toggle from DOM on mobile)
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
      // legacy fallback
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
      localStorage.setItem("seller_sidebar_pinned", String(next));

      document.documentElement.style.setProperty(
        "--seller-sidebar-width",
        next
          ? "clamp(16rem, 18vw, 24rem)"
          : "clamp(5rem, 6vw, 7rem)"
      );

      window.dispatchEvent(
        new CustomEvent("seller-sidebar-change", { detail: next })
      );

      setPinned(next);
    } catch {
      setPinned((p) => !p);
    }
  };

  return (
    <header
      className="w-full bg-white shadow-sm sticky top-0 left-0 z-30"
      style={{ height: "var(--seller-header-height, 80px)" }}
    >
      <div className="flex items-center h-full">
        {/* LEFT: toggle + logo (flush left) */}
        <div className="flex items-center gap-3 pl-4">
          {/* Render toggle ONLY on desktop (md+) */}
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

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <img
              src="/logo.png"
              alt="brand-logo"
              className="block"
              style={{ height: 44, width: "auto", maxWidth: 240 }}
            />
          </Link>
        </div>

        {/* spacer */}
        <div className="flex-1" />

        {/* RIGHT: business name (desktop only) */}
        <div className="hidden md:flex items-center gap-4 pr-4">
          <div className="hidden sm:block text-sm text-gray-700">
            {seller?.businessName}
          </div>
        </div>
      </div>

      <style>{`
        /* enforce square edges */
        button, img {
          border-radius: 0 !important;
        }
      `}</style>
    </header>
  );
}
