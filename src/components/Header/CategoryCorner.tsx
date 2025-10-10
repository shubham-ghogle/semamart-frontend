// src/components/CategoryCorner.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export type CategoryItem = {
  id: string;
  title: string;
  to: string;
  icon?: React.ReactNode | string | React.ComponentType<any>;
};

export type CategoryCornerProps = {
  items?: CategoryItem[]; // optional — defaults used if omitted
  collapsedWidth?: number;
  expandedWidth?: number;
  startExpanded?: boolean;
  className?: string;
};

// default items — update icons/paths to your real assets
const defaultItems: CategoryItem[] = [
  { id: "veg", title: "Vegetables & Fruits", to: "/category/veg", icon: "/heart.svg" },
  { id: "vegan", title: "Vegan Meat", to: "/category/vegan", icon: "/heart.svg" },
  { id: "dairy", title: "Dairy & Eggs", to: "/category/dairy", icon: "/heart.svg" },
  { id: "bakery", title: "Bakery", to: "/category/bakery", icon: "/heart.svg" },
];

export default function CategoryCorner({
  items,
  collapsedWidth = 64,
  expandedWidth = 220,
  startExpanded = false,
  className = "",
}: CategoryCornerProps) {
  const categoryItems = items && items.length ? items : defaultItems;
  const [expanded, setExpanded] = useState(startExpanded);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // render icons that may be strings (urls), components or JSX elements
  const forceIconStyle: React.CSSProperties = {
    width: 20,
    height: 20,
    display: "block",
    color: "#1C170D",
    fill: "currentColor",
    stroke: "currentColor",
    opacity: 1,
    visibility: "visible",
  };

  function renderIcon(icon: CategoryItem["icon"], title: string) {
    if (!icon) return <div style={{ width: 20, height: 20, borderRadius: 9999, background: "#D1D5DB" }} />;
    if (typeof icon === "string") {
      return (
        <img
          src={icon}
          alt={title}
          style={{ ...forceIconStyle, objectFit: "contain" }}
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
        />
      );
    }
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { ...icon.props, style: { ...(icon.props?.style || {}), ...forceIconStyle } });
    }
    if (typeof icon === "function") {
      const IconComp = icon as React.ComponentType<any>;
      return <IconComp style={forceIconStyle} />;
    }
    return <div style={{ width: 20, height: 20, borderRadius: 9999, background: "#D1D5DB" }} />;
  }

  const collapsedW = `${collapsedWidth}px`;
  const expandedW = `${expandedWidth}px`;

  const asideStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: expanded ? expandedW : collapsedW,
    height: "100vh",
    transition: "width 160ms ease",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    borderRight: "1px solid #eee",
    boxSizing: "border-box",
    padding: "12px 8px",
    zIndex: 1000,
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingLeft: expanded ? 6 : 0,
  };

  const hamburgerStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "linear-gradient(180deg, rgba(137,196,95,0.95), rgba(140,194,108,0.95))",
    display: "grid",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const bottomIconsContainerStyle: React.CSSProperties = {
    // keep icons at the bottom
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: expanded ? "stretch" : "center",
    paddingBottom: 16,
    // the marginTop pushes them to bottom because parent is column flex with space distributed
    marginTop: "auto",
    width: "100%",
  };

  const linkBaseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 40,
    textDecoration: "none",
    borderRadius: 8,
    padding: expanded ? "0 8px" : 0,
    justifyContent: expanded ? "flex-start" : "center",
    color: "#1C170D",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <aside
      ref={rootRef}
      style={asideStyle}
      className={className}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(e) => {
        if (!rootRef.current) return;
        if (!rootRef.current.contains(e.relatedTarget as Node)) setExpanded(false);
      }}
      aria-label="Category sidebar"
    >
      {/* Top header with hamburger */}
      <div style={headerStyle}>
        <div style={hamburgerStyle} aria-hidden>
          <svg width="18" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 6h18M3 12h18M3 18h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {expanded && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 700, color: "#1C170D", fontSize: 14 }}>Categories</span>
            <span style={{ fontSize: 11, color: "#6B7280" }}>Quick access</span>
          </div>
        )}
      </div>

      {/* spacer grows and keeps bottom icons at bottom */}
      <div style={{ height: 8 }} />

      {/* Bottom icons group (anchored to bottom via marginTop: auto) */}
      <div style={bottomIconsContainerStyle}>
        {categoryItems.map((c) => {
          const iconNode = renderIcon(c.icon, c.title);

          return (
            <Link
              key={c.id}
              to={c.to}
              onClick={() => setExpanded(false)}
              style={linkBaseStyle}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "#F3F4F6",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-hidden
              >
                {iconNode}
              </span>

              <span
                style={{
                  opacity: expanded ? 1 : 0,
                  transform: expanded ? "translateX(0)" : "translateX(-6px)",
                  transition: "opacity 140ms ease, transform 140ms ease",
                  whiteSpace: "nowrap",
                  pointerEvents: expanded ? "auto" : "none",
                  color: "#111827",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {c.title}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
