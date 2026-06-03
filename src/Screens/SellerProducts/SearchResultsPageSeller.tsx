// src/Screens/Search/SearchResultsPageSeller.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Product, Variant } from "../../Types/types";
import { fetchShopInfo, getProductsByShop } from "../SellerProducts/SellerProducts.hooks";
import ProductCard from "@/components/Homepage/ProductCard";
import CategoryNav from "@/Screens/SellerProducts/CategoryNav"; // adjust path if needed
import { API_URL } from "@/data";
import {
  fetchCategoryOptions,
  matchesProductCategory,
  mergeCategoryOptions,
} from "@/lib/productSearch";

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

  // SEARCH results (from search endpoint)
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>(["All"]);

  // filters / sort (same as before)
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sort, setSort] = useState("relevance");

  // local categories for filter dropdown (kept as before)
  const categories = useMemo(
    () => mergeCategoryOptions(availableCategories, results),
    [availableCategories, results],
  );

  // --- Seller / Shop data + total products + orders ---
  // total products for shop (not search results) using getProductsByShop
  const {
    data: allProducts = [],
    isLoading: allProductsLoading,
    isError: allProductsError,
    error: allProductsFetchError,
  } = useQuery<Product[], Error>({
    queryKey: ["products", "shop", shopId, "all"],
    queryFn: async () => getProductsByShop(shopId ?? ""),
    enabled: !!shopId,
    staleTime: Infinity,
  });

  // shop info
  const {
    data: shopData,
    isError: shopError,
    error: shopFetchError,
  } = useQuery<{ success: boolean; shop?: { _id?: string; businessName?: string; banner?: string; profilePic?: string } }, Error>({
    queryKey: ["shop", shopId],
    queryFn: async () => fetchShopInfo(shopId ?? ""),
    enabled: !!shopId,
    staleTime: Infinity,
  });

  // orders for seller
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersFetchError,
  } = useQuery<{ success: boolean; orders: any[] }, Error>({
    queryKey: ["shopOrders", shopId],
    queryFn: async () => {
      if (!shopId) return { success: false, orders: [] };
      const res = await fetch(`${API_URL}order/get-seller-all-orders/${encodeURIComponent(shopId)}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!shopId,
    staleTime: Infinity,
  });

  // rating (kept hardcoded to match SellerProducts)
  const rating = 4.3;

  useEffect(() => {
    let active = true;

    fetchCategoryOptions()
      .then((items) => {
        if (!active) return;
        setAvailableCategories(items);
      })
      .catch((err) => {
        console.error("Category fetch error", err);
        if (!active) return;
        setAvailableCategories(["All"]);
      });

    return () => {
      active = false;
    };
  }, []);

  // search (fetch products matching q & shopId) — keep the original behavior
  useEffect(() => {
    if (!shopId) {
      setResults([]);
      return;
    }
    setLoading(true);
    setFetchError(null);
    (async () => {
      try {
        const url = `${API_URL}product/searchseller?q=${encodeURIComponent(q || "")}&shopId=${encodeURIComponent(shopId)}`;
        const res = await fetch(url);
        if (!res.ok) {
          setResults([]);
          setFetchError(`Search request failed (${res.status})`);
          return;
        }
        const data = await res.json().catch(() => ({}));
        const products: Product[] = Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data)
          ? data
          : data?.results || data?.items || [];
        setResults(Array.isArray(products) ? products : []);
      } catch (err: any) {
        console.error("Search fetch error", err);
        setResults([]);
        setFetchError(err?.message ?? "Search failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [q, shopId]);

  useEffect(() => {
    if (!categories.some((item) => item.toLowerCase() === category.toLowerCase())) {
      setCategory("All");
    }
  }, [categories, category]);

  // CategoryNav search handler: update URL params (keeps shopId)
  const handleNavSearch = (term: string) => {
    if (!shopId) return;
    const trimmed = term.trim();
    const newParams: Record<string, string> = { shopId };
    if (trimmed.length > 0) newParams.q = trimmed;
    setSearchParams(newParams);
  };

  // Derived values for header
  const productsCount = Array.isArray(allProducts) ? allProducts.length : 0;
  const ordersCount = ordersData?.orders ? ordersData.orders.length : 0;

  // Filtering (same logic)
  let filtered = results.filter((p) => {
    const inCat = matchesProductCategory(p, category);

    const displayPrice = getDisplayDiscountPrice(p);
    const inPrice = displayPrice >= minPrice && displayPrice <= maxPrice;
    return inCat && inPrice;
  });

  // Sorting (same logic)
  if (sort === "lowToHigh") {
    filtered = filtered.sort((a, b) => getDisplayDiscountPrice(a) - getDisplayDiscountPrice(b));
  } else if (sort === "highToLow") {
    filtered = filtered.sort((a, b) => getDisplayDiscountPrice(b) - getDisplayDiscountPrice(a));
  } else if (sort === "rating") {
    filtered = filtered.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
  }

  const renderStars = (value: number) => {
    const full = Math.floor(value);
    const max = 5;
    const stars = [] as JSX.Element[];
    for (let i = 0; i < max; i++) {
      stars.push(
        <span key={i} className={`text-sm ${i < full ? "text-yellow-500" : "text-gray-300"}`}>
          ★
        </span>
      );
    }
    return <span className="inline-flex items-center">{stars}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* --- Seller header at the top (left-aligned) --- */}
        <div className="w-full pt-4 pb-2 mt-2 px-0">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-start md:justify-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                { /* seller name at very top */ }
                {shopData?.shop?.businessName ?? "Shop"}
              </h1>

              <div className="mt-3 flex flex-wrap items-center justify-start gap-4">
                <div className="bg-white shadow rounded-md px-4 py-2 flex flex-col items-start">
                  <span className="text-xs text-gray-500">Products</span>
                  <span className="text-lg font-medium text-gray-900">{allProductsLoading ? "..." : productsCount}</span>
                </div>

                <div className="bg-white shadow rounded-md px-4 py-2 flex flex-col items-start">
                  <span className="text-xs text-gray-500">Orders</span>
                  <span className="text-lg font-medium text-gray-900">{ordersLoading ? "..." : ordersCount}</span>
                </div>

                <div className="bg-white shadow rounded-md px-4 py-2 flex flex-col items-start">
                  <span className="text-xs text-gray-500">Ratings</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium text-gray-900">{rating.toFixed(1)}</span>
                    {renderStars(rating)}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto" />
          </div>
        </div>

        {/* --- CategoryNav under header --- */}
        <div className="-mt-2 mb-4">
          {/* use same categories shape as SellerProducts so drawer shows items */}
          <CategoryNav
            onSearch={handleNavSearch}
            shopId={shopId}
          />
        </div>

        {/* --- Search-results title (moved below the navbar) --- */}
        {q && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Search results for “{q}”
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* --- rest of the page (filters, sort, product grid) kept exactly as before --- */}
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
                    className="text-sm text-white bg-[#1C647C] border border-[#1C647C] rounded-md py-1 px-3 hover:bg-[#164d5f] transition font-medium"
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
            {/* Mobile filters placed here (visible only on small screens) */}
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

              {/* keep sort control on mobile too */}
              <div className="mt-2 flex items-center gap-2">
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

            {/* errors / loading messages (kept) */}
            {fetchError && <div className="text-sm text-red-600 mt-4">Search error: {fetchError}</div>}
            {shopError && <div className="text-sm text-red-600 mt-4">Shop load error: {shopFetchError?.message ?? "Unknown error"}</div>}
            {ordersError && <div className="text-sm text-red-600 mt-4">Orders load error: {ordersFetchError?.message ?? "Unknown error"}</div>}
            {allProductsError && <div className="text-sm text-red-600 mt-4">Products load error: {allProductsFetchError?.message ?? "Unknown error"}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
