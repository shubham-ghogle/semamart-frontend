// src/components/CategoryNav.tsx
import { useState, useRef, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FiChevronDown } from "react-icons/fi";

export type Subcategory = {
  id: string;
  name: string;
  slug?: string;
};

export type Category = {
  id: string;
  name: string;
  slug?: string;
  subcategories?: Subcategory[];
};

type Props = {
  categories: Category[];
  /** How many categories to show inline on large screens */
  maxVisible?: number;
  /** optional search callback (q) => void */
  onSearch?: (q: string) => void;
};

export default function CategoryNav({ categories, maxVisible = 8, onSearch }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null); // which dropdown open (desktop / drawer)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // search state (shared for desktop & mobile)
  const [searchTerm, setSearchTerm] = useState("");

  // close dropdowns on outside click
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // compute desktop inline categories (limit to maxVisible)
  const inlineVisible = categories.length > maxVisible ? categories.slice(0, maxVisible) : categories;

  // helper to toggle index (used by click and keyboard)
  const toggleIndex = (idx: number) => {
    setOpenIndex((cur) => (cur === idx ? null : idx));
  };

  const handleKeyToggle = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleIndex(idx);
    }
  };

  // helper that prevents desktop dropdown from showing while drawer/mobile menu is open
  const isDesktopOpen = (idx: number) => openIndex === idx && !drawerOpen && !mobileMenuOpen;

  // submit search — call prop if provided
  const submitSearch = (q?: string) => {
    const val = (typeof q === "string" ? q : searchTerm).trim();
    if (!val) return;
    if (onSearch) onSearch(val);
  };

  return (
    <div ref={rootRef} className="bg-white border-b border-gray-200 mt-10">
      <div className="max-w-[1460px] mx-auto px-4">
        {/* Desktop / tablet nav */}
        <nav className="hidden md:flex items-center gap-4 h-16">
          {/* categories list (limited to inlineVisible) */}
          <ul className="flex items-center gap-10 flex-1">
            {inlineVisible.map((cat) => {
              const globalIdx = categories.findIndex((c) => c.id === cat.id); // map to global idx so drawer and inline use same index
              const hasSub = !!(cat.subcategories && cat.subcategories.length > 0);
              return (
                <li key={cat.id} className="relative">
                  <a
                    href={hasSub ? "#" : cat.slug ?? "#"}
                    onClick={(e) => {
                      if (hasSub) {
                        e.preventDefault();
                        toggleIndex(globalIdx);
                      }
                      // otherwise allow normal navigation
                    }}
                    onKeyDown={(e) => hasSub && handleKeyToggle(e, globalIdx)}
                    role={hasSub ? "button" : undefined}
                    tabIndex={0}
                    className="text-sm uppercase tracking-wide py-3 px-3 block font-semibold transition-colors duration-150 hover:text-indigo-600"
                    aria-haspopup={hasSub ? "menu" : undefined}
                    aria-expanded={hasSub ? isDesktopOpen(globalIdx) : undefined}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>{cat.name}</span>
                      {hasSub && (
                        <FiChevronDown
                          className={`text-xs transition-transform ${isDesktopOpen(globalIdx) ? "rotate-180" : ""}`}
                          aria-hidden
                        />
                      )}
                    </span>
                  </a>

                  {/* Dropdown if subcategories (uses globalIdx) - only show on desktop when drawer/menu is closed */}
                  {hasSub && (
                    <div
                      className={`absolute left-0 mt-2 w-56 bg-white border rounded shadow-md z-40 transform transition-all origin-top-left
                        ${isDesktopOpen(globalIdx) ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                      role="menu"
                      aria-hidden={!isDesktopOpen(globalIdx)}
                    >
                      <ul className="py-1">
                        {/* MAIN CATEGORY LINK FIRST */}
                        <li>
                          <a
                            href={cat.slug ?? "#"}
                            className="block px-4 py-2 text-sm font-medium hover:bg-gray-50"
                            onClick={() => setOpenIndex(null)}
                          >
                            {cat.name}
                          </a>
                        </li>

                        <li>
                          <div className="border-t my-1" />
                        </li>

                        {cat.subcategories!.map((sub) => (
                          <li key={sub.id}>
                            <a
                              href={sub.slug ?? "#"}
                              className="block px-4 py-2 text-sm hover:bg-gray-50"
                              onClick={() => setOpenIndex(null)}
                            >
                              {sub.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}

            {/* All control at the end (opens drawer showing all categories) */}
            <li>
              <button
                onClick={() => {
                  // clear desktop open index when opening drawer so desktop doesn't flash open
                  setOpenIndex(null);
                  setDrawerOpen(true);
                }}
                className="flex items-center gap-2 text-sm uppercase tracking-wide py-3 px-3 font-semibold border rounded transition-all hover:bg-gray-50"
                aria-label="Open all categories"
              >
                All
                <FiChevronDown className="text-sm" />
              </button>
            </li>
          </ul>

          {/* Right side: desktop search input */}
          <div className="flex items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
            >
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search this shop"
                className="border border-gray-300 rounded px-3 py-2 text-sm w-64 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitSearch();
                  }
                }}
              />
            </form>
          </div>
        </nav>

        {/* Mobile: search visible and horizontal scroller with all categories */}
        <div className="md:hidden">
          {/* Mobile top row: menu icon + search */}
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open category menu"
              className="p-2"
            >
              <span className="block w-6 h-0.5 bg-gray-700 mb-1" />
              <span className="block w-6 h-0.5 bg-gray-700 mb-1" />
              <span className="block w-6 h-0.5 bg-gray-700" />
            </button>

            <div className="flex-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch();
                }}
              >
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search this shop"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </form>
            </div>
          </div>

          {/* Mobile horizontal scroller with ALL categories (so user can always access any category inline on mobile) */}
          <div className="overflow-x-auto no-scrollbar px-3 pb-3">
            <ul className="flex gap-6 whitespace-nowrap">
              {categories.map((c, idx) => (
                <li key={c.id} className="flex items-center">
                  <a
                    href={c.slug ?? "#"}
                    className="block text-sm py-2 px-2 font-semibold transition-colors duration-150 hover:text-indigo-600"
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>{c.name}</span>
                    </span>
                  </a>

                  {c.subcategories && c.subcategories.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDrawerOpen(true);
                        setMobileMenuOpen(true);
                        setOpenIndex(idx); // opening drawer with expansion — desktop will stay closed due to isDesktopOpen guard
                      }}
                      aria-label={`Open ${c.name} subcategories`}
                      className="ml-1 p-1 rounded hover:bg-gray-50"
                    >
                      <FiChevronDown className={`text-xs ${openIndex === idx ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Drawer / Sidebar for "All" and mobile full menu */}
      <div
        className={`fixed inset-0 z-50 transition-all ${drawerOpen || mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen && !mobileMenuOpen}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen || mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => {
            setDrawerOpen(false);
            setMobileMenuOpen(false);
            setOpenIndex(null);
          }}
        />

        {/* panel */}
        <aside
          className={`absolute left-0 top-0 bottom-0 w-[300px] bg-white border-r shadow-xl transform transition-transform
            ${drawerOpen || mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="font-semibold">All Categories</span>
            </div>
            <button
              onClick={() => {
                setDrawerOpen(false);
                setMobileMenuOpen(false);
                setOpenIndex(null);
              }}
              aria-label="Close"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>

          <nav className="p-3 overflow-auto h-full">
            <ul>
              {categories.map((cat, idx) => (
                <li key={cat.id} className="border-b last:border-b-0">
                  {/* sidebar row: category name (navigates) + small chevron to toggle sub-list */}
                  <div className="flex items-center justify-between py-3 px-2">
                    <a
                      href={cat.slug ?? "#"}
                      className="text-sm font-medium"
                      onClick={() => {
                        setDrawerOpen(false);
                        setMobileMenuOpen(false);
                        setOpenIndex(null);
                      }}
                    >
                      {cat.name}
                    </a>

                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenIndex((cur) => (cur === idx ? null : idx));
                        }}
                        aria-expanded={openIndex === idx}
                        aria-controls={`cat-${cat.id}-subs`}
                        className="p-1 rounded hover:bg-gray-50"
                      >
                        <FiChevronDown className={`text-sm transition-transform ${openIndex === idx ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>

                  {/* render subcategories when that index is open */}
                  {cat.subcategories && cat.subcategories.length > 0 && openIndex === idx && (
                    <ul id={`cat-${cat.id}-subs`} className="pl-4 pb-3">
                      {cat.subcategories.map((s) => (
                        <li key={s.id}>
                          <a
                            href={s.slug ?? "#"}
                            className="block py-2 text-sm"
                            onClick={() => {
                              setDrawerOpen(false);
                              setMobileMenuOpen(false);
                              setOpenIndex(null);
                            }}
                          >
                            {s.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
