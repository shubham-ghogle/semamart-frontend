// src/components/CategoryNav.tsx
import { API_URL } from "@/data";
import { useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/**
 * CategoryNav — API-driven categories + subcategories.
 * Navigation now mirrors Header.tsx:
 *  - category -> /get-products-by-category/:id
 *  - subcategory -> /get-products-by-subcategory/:id
 */

export type Subcategory = {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
};

export type Category = {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  subcategories?: (string | Subcategory)[];
};

type Props = {
  categories?: Category[]; // optional — prop wins
  shopId?: string;
  onSearch?: (q: string) => void;
};

function getId(objOrId?: any) {
  if (!objOrId) return "";
  if (typeof objOrId === "string") return objOrId;
  return String(objOrId._id ?? objOrId.id ?? "");
}

function normalizeSubcat(s: any): Subcategory {
  if (!s) return { _id: "", name: "", slug: undefined };
  if (typeof s === "string") return { _id: s, name: s, slug: undefined };
  return {
    _id: String(s._id ?? s.id ?? ""),
    id: s.id ?? undefined,
    name: String(s.name ?? s.label ?? ""),
    slug: s.slug ?? undefined,
  };
}

export default function CategoryNav({ categories: propCategories, shopId, onSearch }: Props) {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // API-driven categories (fallback if prop not provided)
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // subcategories cache keyed by normalized catId
  const [subcategoryMap, setSubcategoryMap] = useState<Record<string, Subcategory[] | "loading">>({});

  // search state
  const [searchTerm, setSearchTerm] = useState("");

  // resolved categories: prop wins -> else fetched
  const resolvedCategories: Category[] = (propCategories ?? categories) as Category[];

  // outside click to close dropdowns
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

  // fetch categories on mount (if prop not supplied)
  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setIsLoadingCategories(false);
      setCategories(propCategories);
      setCategoriesError(null);
      return;
    }

    let mounted = true;
    setIsLoadingCategories(true);
    fetch(API_URL+"category/")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.categories)
          ? data.categories
          : Array.isArray(data.data)
          ? data.data
          : [];
        setCategories(arr);
        setCategoriesError(null);
      })
      .catch((err: any) => {
        console.error("Category fetch error:", err);
        if (!mounted) return;
        setCategories([]);
        setCategoriesError(err?.message || "Failed to load categories");
      })
      .finally(() => {
        if (mounted) setIsLoadingCategories(false);
      });

    return () => {
      mounted = false;
    };
  }, [propCategories]);

  // fetch subcategories for a category (cache results)
  const fetchSubcategories = (anyCategory: Category | string) => {
    const catId = typeof anyCategory === "string" ? getId(anyCategory) : getId(anyCategory._id ?? anyCategory.id ?? anyCategory);
    if (!catId) return;
    const current = subcategoryMap[catId];
    if (current && current !== "loading") return;
    if (current === "loading") return;

    setSubcategoryMap((prev) => ({ ...prev, [catId]: "loading" }));

    fetch(`${API_URL}category/${encodeURIComponent(catId)}/subcategories`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch subcategories: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.subcategories)
          ? data.subcategories
          : Array.isArray(data.data)
          ? data.data
          : [];
        const mapped = arr.map(normalizeSubcat).filter((s:any) => s._id);
        setSubcategoryMap((prev) => ({ ...prev, [catId]: mapped }));
      })
      .catch((err) => {
        console.error("Subcategory fetch error:", err);
        setSubcategoryMap((prev) => ({ ...prev, [catId]: [] }));
      });
  };

  // When user toggles a category in drawer, ensure subcategories are loaded
  const handleCategoryToggle = (idx: number, cat?: Category) => {
    setOpenIndex((cur) => (cur === idx ? null : idx));
    if (!cat) return;
    const catId = getId(cat._id ?? cat.id ?? cat);

    // if category already includes populated subcat objects, cache them
    if (Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && typeof cat.subcategories[0] !== "string") {
      const normalized = (cat.subcategories as any[]).map(normalizeSubcat);
      setSubcategoryMap((prev) => ({ ...prev, [catId]: normalized }));
      return;
    }

    // otherwise fetch remote subcategories
    fetchSubcategories(catId);
  };

  // submit search
  const submitSearch = (q?: string) => {
    const val = (typeof q === "string" ? q : searchTerm).trim();
    if (!val) return;
    if (onSearch) onSearch(val);
  };

  const homeHref = shopId ? `/shop/${encodeURIComponent(shopId)}` : "/";

  return (
    <div ref={rootRef} className="bg-white border-b border-gray-200 mt-10">
      <div className="max-w-[1460px] mx-auto px-4">
        {/* Desktop / tablet nav */}
        <nav className="hidden md:flex items-center gap-4 h-16">
          <div className="flex items-center gap-4">
            <a href={homeHref} className="text-sm font-semibold uppercase tracking-wide">
              Home
            </a>
          </div>

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

        {/* Mobile */}
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
        </div>
      </div>

      {/* Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => {
            setDrawerOpen(false);
            setOpenIndex(null);
          }}
        />

        <aside
          className={`absolute left-0 top-0 bottom-0 w-[300px] bg-white border-r shadow-xl transform transition-transform
            ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="font-semibold">All Categories</span>
              {isLoadingCategories ? <span className="ml-2 text-xs text-gray-500">Loading...</span> : null}
              {categoriesError ? <span className="ml-2 text-xs text-red-500">Failed</span> : null}
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
              {resolvedCategories.length === 0 && !isLoadingCategories ? (
                <li className="py-4 text-sm text-gray-500">No categories found.</li>
              ) : (
                resolvedCategories.map((cat, idx) => {
                  const catId = getId(cat._id ?? cat.id ?? cat);
                  const populated = Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && typeof cat.subcategories[0] !== "string";
                  const subcatsToShow: Subcategory[] =
                    populated
                      ? (cat.subcategories as any[]).map(normalizeSubcat)
                      : Array.isArray(subcategoryMap[catId]) ? (subcategoryMap[catId] as Subcategory[]) : [];

                  const subcatsState = subcategoryMap[catId]; // undefined | "loading" | Subcategory[]

                  return (
                    <li key={catId || idx} className="border-b last:border-b-0">
                      <div className="flex items-center justify-between py-3 px-2">
                        {/* category link: use navigate like Header */}
                        <a
                          href={cat.slug ?? `/get-products-by-category/${catId}`}
                          className="text-sm font-medium"
                          onClick={(e) => {
                            e.preventDefault();
                            setDrawerOpen(false);
                            setOpenIndex(null);
                            if (catId) navigate(`/get-products-by-category/${catId}`);
                          }}
                        >
                          {cat.name}
                        </a>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCategoryToggle(idx, cat);
                          }}
                          aria-expanded={openIndex === idx}
                          aria-controls={`cat-${catId}-subs`}
                          className="p-1 rounded hover:bg-gray-50"
                        >
                          <FiChevronDown className={`text-sm transition-transform ${openIndex === idx ? "rotate-180" : ""}`} />
                        </button>
                      </div>

                      {openIndex === idx && (
                        <ul id={`cat-${catId}-subs`} className="pl-4 pb-3">
                          {subcatsState === "loading" ? (
                            <li className="py-2 text-xs text-gray-500">Loading subcategories...</li>
                          ) : subcatsToShow.length > 0 ? (
                            subcatsToShow.map((s) => (
                              <li key={s._id} className="">
                                <a
                                  href={s.slug ?? `/get-products-by-subcategory/${s._id}`}
                                  className="block py-2 text-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setDrawerOpen(false);
                                    setOpenIndex(null);
                                    if (s._id) navigate(`/get-products-by-subcategory/${s._id}`);
                                  }}
                                >
                                  {s.name}
                                </a>
                              </li>
                            ))
                          ) : (
                            <li className="py-2 text-xs text-gray-500">No subcategories</li>
                          )}
                        </ul>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
