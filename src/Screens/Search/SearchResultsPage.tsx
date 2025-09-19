import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Product, Variant } from "../../Types/types";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/UIComponents/collapsible";

const PLACEHOLDER = "/placeholder.png";

/** Convert backend image value to public URL.
 * If image already starts with "/" or "http", keep it.
 * Otherwise map to `/images/<value>`
 */
function toImageUrl(value?: string | null) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return value;
  return `/images/${value}`;
}

/** Choose the best variant for display:
 * - prefer variant with smallest discountPrice (if discountPrice present)
 * - fallback to first variant
 * - returns undefined if no variants
 */
function pickBestVariant(variants?: Variant[]) {
  if (!Array.isArray(variants) || variants.length === 0) return undefined;
  // find variant with lowest discountPrice (if present), otherwise lowest originalPrice
  const withDiscount = variants.filter((v) => typeof v.discountPrice === "number");
  if (withDiscount.length > 0) {
    return withDiscount.reduce((a, b) => ( (a.discountPrice! < b.discountPrice!) ? a : b ));
  }
  return variants[0];
}

/** Helpers to get display prices (number) */
function getDisplayDiscountPrice(p: Product) {
  const v = pickBestVariant(p.variants);
  return v?.discountPrice ?? v?.originalPrice ?? 0;
}
function getDisplayOriginalPrice(p: Product) {
  const v = pickBestVariant(p.variants);
  return v?.originalPrice ?? 0;
}

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sort, setSort] = useState("relevance");

  const categories = ["All", "Consumables", "Pharmaceutical", "Equipment"];

  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s);

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/v2/product/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = await res.json().catch(() => ({}));
        // API may return { products: [...] } or directly [...]
        const products: Product[] = Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data)
          ? data
          : data?.results || data?.items || [];
        setResults(Array.isArray(products) ? products : []);
      } catch (err) {
        console.error("Search fetch error", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [q]);

// Filtering
let filtered = results.filter((p) => {
  // category: using productType (matches your interface)
  const inCat =
    category === "All" ||
    p.productType === category ||
    (Array.isArray(p.category) ? p.category.includes(category) : p.category === category);

  const displayPrice = getDisplayDiscountPrice(p);
  const inPrice = displayPrice >= minPrice && displayPrice <= maxPrice;
  return inCat && inPrice;
});

  // Sorting
  if (sort === "lowToHigh") {
    filtered = filtered.sort((a, b) => getDisplayDiscountPrice(a) - getDisplayDiscountPrice(b));
  } else if (sort === "highToLow") {
    filtered = filtered.sort((a, b) => getDisplayDiscountPrice(b) - getDisplayDiscountPrice(a));
  } else if (sort === "rating") {
    filtered = filtered.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Heading & Sort */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold mb-2 md:mb-0 text-gray-800">
          Search results for “{q}”
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded px-2 py-1 text-sm focus:outline-none"
          >
            <option value="relevance">Relevance</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 bg-white p-4 rounded-xl shadow space-y-4 transition-all">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full flex justify-between items-center text-left font-semibold text-gray-700 py-2 hover:text-blue-600 transition">
              <span>Category</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-300 data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-1">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full flex justify-between items-center text-left font-semibold text-gray-700 py-2 hover:text-blue-600 transition">
              <span>Price Range</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-300 data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-1">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value || 0))}
                  className="w-1/2 border border-gray-300 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value || 0))}
                  className="w-1/2 border border-gray-300 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Max"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="pt-4">
            <button
              onClick={() => {
                setCategory("All");
                setMinPrice(0);
                setMaxPrice(100000);
                setSort("relevance");
              }}
              className="w-full text-sm text-blue-600 border border-blue-500 rounded-md py-1 hover:bg-blue-50 transition font-medium"
            >
              Reset filters
            </button>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <section className="flex-1 w-full">
          {loading ? (
            <p className="text-gray-600">Loading…</p>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((p) => {
                const discountPercent =
                  (getDisplayOriginalPrice(p) && getDisplayOriginalPrice(p) > 0)
                    ? Math.round(((getDisplayOriginalPrice(p) - getDisplayDiscountPrice(p)) / Math.max(getDisplayOriginalPrice(p), 1)) * 100)
                    : null;

                const inWishlist = wishlist.some((w) => w._id === p._id);

                // Image: try product.images[0] else placeholder
                const imgSrc = (Array.isArray(p.images) && p.images.length > 0)
                  ? toImageUrl(p.images[0]) ?? PLACEHOLDER
                  : PLACEHOLDER;

                const dispPrice = getDisplayDiscountPrice(p);
                const origPrice = getDisplayOriginalPrice(p);

                return (
                  <Link key={p._id} to={`/product/${p._id}`} className="block">
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition p-3 relative h-full flex flex-col">
                      {discountPercent ? (
                        <span className="absolute top-2 right-2 text-[11px] text-[#DF848E] border border-[#DF848E] px-2 py-0.5 rounded-md font-semibold">
                          -{discountPercent}%
                        </span>
                      ) : null}

                      <div className="flex-shrink-0">
                        <img
                          src={imgSrc}
                          alt={p.name}
                          className="w-full h-40 object-contain bg-gray-100 p-2 rounded"
                          onError={(e) => ((e.currentTarget as HTMLImageElement).src = PLACEHOLDER)}
                        />
                      </div>

                      <div className="pt-3 flex-1 flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[38px]">
                          {p.name}
                        </h3>
                        <span className="text-xs text-gray-500">{p.productType || p.category}</span>

                        {/* Ratings */}
                        <div className="flex items-center mt-1 space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const starNumber = i + 1;
                            const rating = p.ratings ?? 0;
                            if (rating >= starNumber) {
                              return <span key={i} className="text-yellow-400">★</span>;
                            } else if (rating >= starNumber - 0.5) {
                              return <span key={i} className="text-yellow-400">☆</span>;
                            } else {
                              return <span key={i} className="text-gray-300">★</span>;
                            }
                          })}
                          <span className="text-xs text-gray-600 ml-1">({(p.ratings ?? 0).toFixed(1)})</span>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-green-600 font-bold text-lg">
                            ₹{dispPrice.toLocaleString()}
                          </span>
                          {origPrice > 0 && (
                            <span className="text-sm line-through text-gray-400">
                              ₹{origPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex justify-between items-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
addToCart({
  product: p,
  qty: 1,
  productId: p._id,
  shopId: typeof p.shopId === "string" ? p.shopId : p.shopId._id,
  variantId: p.variants?.[0]?._id ?? null,
  variant: p.variants?.[0], // optional
});
                            }}
                            className="bg-[#005B5D] text-white text-xs px-3 py-1 rounded-full hover:bg-[#004C4D]"
                          >
                            Add to Cart
                          </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              inWishlist ? removeFromWishlist(p._id) : addToWishlist(p);
                            }}
                            className="w-6 h-6 rounded-full bg-white border flex items-center justify-center"
                            aria-label="toggle wishlist"
                          >
                            <span
                              style={{
                                WebkitMaskImage: "url('/heart_icon.png')",
                                WebkitMaskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                                maskImage: "url('/heart_icon.png')",
                                maskSize: "contain",
                                maskRepeat: "no-repeat",
                                maskPosition: "center",
                                backgroundColor: inWishlist ? "#DF848E" : "#1C647C",
                              }}
                              className="w-4 h-4 inline-block"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">No products match your filters.</p>
          )}
        </section>
      </div>
    </div>
  );
}
