// src/components/CategoryNav.tsx
import { useState, useRef, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FiChevronDown } from "react-icons/fi";
import defaultCategories from "./shopCategories"; // adjust path if your alias differs

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
  categories?: Category[]; // optional now — fallback to shared list
  /** optional shop id to link Home back to this shop */
  shopId?: string;
  /** optional search callback (q) => void */
  onSearch?: (q: string) => void;
};

export default function CategoryNav({ categories, shopId, onSearch }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null); // which dropdown open inside drawer

  // resolved categories: prop wins; otherwise use shared file
  const resolvedCategories: Category[] = (categories ?? defaultCategories) as Category[];

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

  // submit search — call prop if provided
  const submitSearch = (q?: string) => {
    const val = (typeof q === "string" ? q : searchTerm).trim();
    if (!val) return;
    if (onSearch) onSearch(val);
  };

  // link Home to shop if shopId provided
  const homeHref = shopId ? `/shop/${encodeURIComponent(shopId)}` : "/";

  return (
    <div ref={rootRef} className="bg-white border-b border-gray-200 mt-10">
      <div className="max-w-[1460px] mx-auto px-4">
        {/* Desktop / tablet nav: Home, Search (now full width), All */}
        <nav className="hidden md:flex items-center gap-4 h-16">
          <div className="flex items-center gap-4">
            <a href={homeHref} className="text-sm font-semibold uppercase tracking-wide">
              Home
            </a>
          </div>

          {/* Search now takes the entire remaining space */}
          <div className="flex-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="w-full"
            >
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search this shop"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitSearch();
                  }
                }}
              />
            </form>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => {
                setOpenIndex(null);
                setDrawerOpen(true);
              }}
              className="flex items-center gap-2 text-sm uppercase tracking-wide py-2 px-3 font-semibold border rounded transition-all hover:bg-gray-50"
              aria-label="Open all categories"
            >
              All
              <FiChevronDown className="text-sm" />
            </button>
          </div>
        </nav>

        {/* Mobile: show Home, Search (bigger), and All button */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 py-3">
            <a href={homeHref} className="text-sm font-semibold px-2">
              Home
            </a>

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

            <button
              onClick={() => {
                setOpenIndex(null);
                setDrawerOpen(true);
              }}
              aria-label="Open category menu"
              className="p-2"
            >
              <FiChevronDown size={18} />
            </button>
          </div>

          {/* no horizontal scroller here (keeps UI compact) */}
        </div>
      </div>

      {/* Drawer / Sidebar for "All" and mobile full menu */}
      <div
        className={`fixed inset-0 z-50 transition-all ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => {
            setDrawerOpen(false);
            setOpenIndex(null);
          }}
        />

        {/* panel */}
        <aside
          className={`absolute left-0 top-0 bottom-0 w-[300px] bg-white border-r shadow-xl transform transition-transform
            ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="font-semibold">All Categories</span>
            </div>
            <button
              onClick={() => {
                setDrawerOpen(false);
                setOpenIndex(null);
              }}
              aria-label="Close"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>

          <nav className="p-3 overflow-auto h-full">
            <ul>
              {resolvedCategories.map((cat, idx) => (
                <li key={cat.id} className="border-b last:border-b-0">
                  <div className="flex items-center justify-between py-3 px-2">
                    <a
                      href={cat.slug ?? "#"}
                      className="text-sm font-medium"
                      onClick={() => {
                        setDrawerOpen(false);
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

                  {cat.subcategories && cat.subcategories.length > 0 && openIndex === idx && (
                    <ul id={`cat-${cat.id}-subs`} className="pl-4 pb-3">
                      {cat.subcategories.map((s) => (
                        <li key={s.id}>
                          <a
                            href={s.slug ?? "#"}
                            className="block py-2 text-sm"
                            onClick={() => {
                              setDrawerOpen(false);
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
