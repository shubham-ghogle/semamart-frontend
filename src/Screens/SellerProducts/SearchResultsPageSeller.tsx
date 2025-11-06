import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Product, Variant } from "../../Types/types";
import { fetchShopInfo } from "../SellerProducts/SellerProducts.hooks";
import ProductCard from "@/components/Homepage/ProductCard";

//const PLACEHOLDER = "/placeholder.png";

function pickBestVariant(variants?: Variant[]) {
  if (!Array.isArray(variants) || variants.length === 0) return undefined;
  const withDiscount = variants.filter((v) => typeof v.discountPrice === "number");
  if (withDiscount.length > 0) {
    return withDiscount.reduce((a, b) => (a.discountPrice! < b.discountPrice! ? a : b));
  }
  return variants[0];
}

function getDisplayDiscountPrice(p: Product) {
  const v = pickBestVariant(p.variants);
  return v?.discountPrice ?? v?.originalPrice ?? 0;
}

export default function SearchResultsPageSeller() {
  const [params, setSearchParams] = useSearchParams();
  const routeParams = useParams<{ shopId?: string }>();

  const q = params.get("q") || "";
  const shopIdFromQuery = params.get("shopId") || undefined;
  const shopId = shopIdFromQuery || routeParams.shopId;

  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // seller/shop info
  const [shopName, setShopName] = useState<string | null>(null);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopError, setShopError] = useState<string | null>(null);

  // search input state (so user can search again)
  const [searchInput, setSearchInput] = useState<string>(q);

  // keep local input in sync when URL changes externally
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // filters / sort
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sort, setSort] = useState("relevance");

  // categories (can be fetched later)
  const categories = ["All", "Consumables", "Pharmaceutical", "Equipment"];

  // fetch seller name
  useEffect(() => {
    if (!shopId) {
      setShopName(null);
      return;
    }
    setShopLoading(true);
    setShopError(null);
    (async () => {
      try {
        const res = await fetchShopInfo(shopId);
        setShopName(res.shop?.businessName ?? `Shop ${shopId}`);
      } catch (err: any) {
        console.error("fetchShopInfo error", err);
        setShopError(err?.message ?? "Failed to load shop");
        setShopName(`Shop ${shopId}`);
      } finally {
        setShopLoading(false);
      }
    })();
  }, [shopId]);

  // fetch products for seller
  useEffect(() => {
    if (!shopId) {
      setResults([]);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const url = `/api/v2/product/searchseller?q=${encodeURIComponent(q || "")}&shopId=${encodeURIComponent(
          shopId
        )}`;
        const res = await fetch(url);
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = await res.json().catch(() => ({}));
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
  }, [q, shopId]);

  // submit search: updates URL params (which triggers the effect above)
  const submitSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!shopId) return;
    const trimmed = (searchInput || "").trim();
    // keep shopId in params, remove q if empty
    const newParams: Record<string, string> = { shopId };
    if (trimmed.length > 0) newParams.q = trimmed;
    setSearchParams(newParams);
  };

  // Filtering
  let filtered = results.filter((p) => {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header: title + seller + search input */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Search results for “{q}”</h1>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-sm text-gray-500">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              </p>
              {shopLoading ? (
                <p className="text-sm text-gray-400">Loading seller…</p>
              ) : shopError ? (
                <p className="text-sm text-red-500">Seller load error</p>
              ) : shopName ? (
                <p className="text-sm text-gray-600">
                  Sold by <span className="font-medium text-gray-800">{shopName}</span>
                </p>
              ) : null}
            </div>
          </div>

<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:ml-auto">

  {/* search form - full width on mobile, fixed on sm+ */}
  <form onSubmit={submitSearch} className="flex items-center gap-2 w-full sm:w-auto">
    <input
      type="search"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      placeholder="Search this shop"
      className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-64 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
    />
    <button
      type="submit"
      className="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
    >
      Search
    </button>
  </form>

  {/* sort control grouped to the right on sm+, stacked on mobile */}
  <div className="flex items-center gap-2 sm:ml-2">
    <label className="text-sm text-gray-600">Sort</label>
    <select
      value={sort}
      onChange={(e) => setSort(e.target.value)}
      className="appearance-none border border-gray-200 bg-white rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
    >
      <option value="relevance">Relevance</option>
      <option value="lowToHigh">Price: Low to High</option>
      <option value="highToLow">Price: High to Low</option>
      <option value="rating">Rating</option>
    </select>
  </div>
</div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters (desktop only) */}
          <aside className="hidden lg:block w-64">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 lg:mb-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800 font-medium">Filters</h3>
                <button
                  onClick={() => {
                    setCategory("All");
                    setMinPrice(0);
                    setMaxPrice(100000);
                    setSort("relevance");
                  }}
                  className="text-sm text-blue-600"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Price range (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value || 0))}
                      className="w-1/2 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value || 0))}
                      className="w-1/2 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main column */}
          <div className="flex-1">
            {/* Mobile filters placed once here (visible only on small screens) */}
            <div className="lg:hidden mb-4">
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="font-medium text-gray-700">Filters</span>
                    <span className="text-gray-500">▾</span>
                  </summary>

                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Price range (₹)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(Number(e.target.value || 0))}
                          className="w-1/2 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value || 0))}
                          className="w-1/2 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* product grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl h-72 p-4" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((p) => (
                  <div key={p._id} className="w-full">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-10 rounded-xl text-center">
                <p className="text-gray-700 mb-2">No products match your filters.</p>
                <p className="text-sm text-gray-500">Try clearing filters or searching with a different term.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
