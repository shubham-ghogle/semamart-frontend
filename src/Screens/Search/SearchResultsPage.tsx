import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Product } from "../../Types/types";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"; // Make sure to install @headlessui/react
const BASE_URL = "http://localhost:8000";

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sort, setSort] = useState("relevance");

  const categories = ["All", "Consumables", "Pharmaceutical", "Equipment"];

  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/v2/product/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => setResults(data.products || []))
      .finally(() => setLoading(false));
  }, [q]);

  // Filtering
  let filtered = results.filter((p) => {
    const inCat = category === "All" || p.productType === category;
    const inPrice = p.discountPrice >= minPrice && p.discountPrice <= maxPrice;
    return inCat && inPrice;
  });

  // Sorting
  if (sort === "lowToHigh") {
    filtered.sort((a, b) => a.discountPrice - b.discountPrice);
  } else if (sort === "highToLow") {
    filtered.sort((a, b) => b.discountPrice - a.discountPrice);
  } else if (sort === "rating") {
    filtered.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
  }

  return (
    <div className="p-6 bg-gray-50 ">
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
          <Disclosure defaultOpen>
            {({ open }) => (
              <div className="transition-all">
                <DisclosureButton className="w-full flex justify-between items-center text-left font-semibold text-gray-700 py-2 hover:text-blue-600 transition">
                  <span>Category</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </DisclosureButton>
                <DisclosurePanel className="pt-1">
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
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>

          <Disclosure defaultOpen>
            {({ open }) => (
              <div className="transition-all">
                <DisclosureButton className="w-full flex justify-between items-center text-left font-semibold text-gray-700 py-2 hover:text-blue-600 transition">
                  <span>Price Range</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </DisclosureButton>
                <DisclosurePanel className="pt-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(+e.target.value)}
                      className="w-1/2 border border-gray-300 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(+e.target.value)}
                      className="w-1/2 border border-gray-300 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      placeholder="Max"
                    />
                  </div>
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>

          <div className="pt-4">
            <button
              onClick={() => {
                setCategory("All");
                setMinPrice(0);
                setMaxPrice(10000);
                setSort("relevance");
              }}
              className="w-full text-sm text-blue-600 border border-blue-500 rounded-md py-1 hover:bg-blue-50 transition font-medium"
            >
              Reset filters
            </button>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <section className="flex-1">
          {loading ? (
            <p className="text-gray-600">Loading…</p>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((p) => {
                // const imgUrl =
                //   p.images?.[0] ? `${BASE_URL}/${p.images[0]}` : "/image60.png";
                const discount = p.originalPrice
                  ? Math.round(
                      ((p.originalPrice - p.discountPrice) / p.originalPrice) * 100
                    )
                  : null;
                const inWishlist = wishlist.some((w) => w._id === p._id);

                return (
                  <Link key={p._id} to={`/product/${p._id}`}>
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition p-3 relative">
                      {discount && (
                        <span className="absolute top-2 right-2 text-[11px] text-[#DF848E] border border-[#DF848E] px-2 py-0.5 rounded-md font-semibold">
                          -{discount}%
                        </span>
                      )}

                      <img
                        src="/image60.png"
                        alt={p.name}
                        className="w-full h-40 object-contain bg-gray-100 p-2 rounded"
                      />

                      <div className="pt-3">
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[38px]">
                          {p.name}
                        </h3>
                        <span className="text-xs text-gray-500">{p.productType}</span>

                        {/* Ratings */}
                        <div className="flex items-center mt-1 space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const starNumber = i + 1;
                            const rating = p.ratings || 0;
                            if (rating >= starNumber) {
                              return (
                                <span key={i} className="text-yellow-400">
                                  ★
                                </span>
                              );
                            } else if (rating >= starNumber - 0.5) {
                              return (
                                <span key={i} className="text-yellow-400">
                                  ☆
                                </span>
                              );
                            } else {
                              return (
                                <span key={i} className="text-gray-300">★</span>
                              );
                            }
                          })}
                          <span className="text-xs text-gray-600 ml-1">
                            ({p.ratings?.toFixed(1) || "0"})
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-green-600 font-bold text-lg">
                            ₹{p.discountPrice}
                          </span>
                          {p.originalPrice && (
                            <span className="text-sm line-through text-gray-400">
                              ₹{p.originalPrice}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex justify-between items-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart({ product: p, qty: 1 });
                            }}
                            className="bg-[#005B5D] text-white text-xs px-3 py-1 rounded-full hover:bg-[#004C4D]"
                          >
                            Add to Cart
                          </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              inWishlist
                                ? removeFromWishlist(p._id)
                                : addToWishlist(p);
                            }}
                            className="w-6 h-6 rounded-full bg-white border flex items-center justify-center"
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
