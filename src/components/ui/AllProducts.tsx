import { useState, useEffect, useMemo } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Product } from "../../Types/types";
import DefaultProductCard from "../../components/Product/ProductCard";
import { API_URL } from "@/data";

export default function AllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search] = useState("");
  const [sort, setSort] = useState("popularity");
  const [selectedManufacturerName, setSelectedManufacturerName] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);

  // --- Fetch Logic ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}product/all-products`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        if (data?.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setError(data.message || "Unexpected response format");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- Helpers ---
  const getProductPrice = (p: Product) => {
    const v = p.variants?.[0];
    return v?.discountPrice ?? v?.originalPrice ?? 0;
  };

  const getManufacturerName = (p: Product) => {
    if (!p.manufacturer) return "Unknown";
    return typeof p.manufacturer === "object"
      ? p.manufacturer.manufacturerName || "Unknown"
      : p.manufacturer;
  };

  const allManufacturerNames = useMemo(() => {
    return [...new Set(products.map(getManufacturerName).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const price = getProductPrice(p);
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesBrand =
          selectedManufacturerName.length === 0 ||
          selectedManufacturerName.includes(getManufacturerName(p));
        const matchesMinPrice = minPrice === "" || price >= minPrice;
        const matchesMaxPrice = maxPrice === "" || price <= maxPrice;

        return matchesSearch && matchesBrand && matchesMinPrice && matchesMaxPrice;
      })
      .sort((a, b) => {
        const priceA = getProductPrice(a);
        const priceB = getProductPrice(b);
        if (sort === "priceLow") return priceA - priceB;
        if (sort === "priceHigh") return priceB - priceA;
        return 0;
      });
  }, [products, search, sort, selectedManufacturerName, minPrice, maxPrice]);

  if (loading || error) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          {loading ? "Loading..." : error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Header />

      <div className="flex flex-1 overflow-hidden">

        {/* Overlay (Mobile only) */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300
            md:relative md:translate-x-0 md:w-64 md:z-1 border-r p-5
            flex flex-col h-full overflow-y-auto
            ${showFilters ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Close Button (Mobile) */}
          <div className="md:hidden flex justify-end mb-4">
            <button onClick={() => setShowFilters(false)}>✕</button>
          </div>

          <h3 className="text-lg font-bold mb-6">Filters</h3>

          {/* Brand Filter */}
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-4">
              Brand
            </h4>
            <div className="space-y-3">
              {allManufacturerNames.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center text-sm cursor-pointer hover:text-cyan-700"
                >
                  <input
                    type="checkbox"
                    className="mr-3 accent-cyan-700"
                    checked={selectedManufacturerName.includes(brand)}
                    onChange={() => {
                      setSelectedManufacturerName((prev) =>
                        prev.includes(brand)
                          ? prev.filter((b) => b !== brand)
                          : [...prev, brand]
                      );
                    }}
                  />
                  {brand}
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-4">
              Price Range
            </h4>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              className="w-full border p-2 rounded mb-2 text-sm bg-white"
              onChange={(e) =>
                setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              className="w-full border p-2 rounded text-sm bg-white"
              onChange={(e) =>
                setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable grid container separate from global footer */}
          <div className="flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="p-4 md:p-8">

              {/* Header Row */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  Products ({filteredProducts.length})
                </h2>

                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="md:hidden border px-3 py-2 rounded bg-white text-sm"
                  >
                    Filters
                  </button>

                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="border p-2 rounded text-sm bg-white"
                  >
                    <option value="popularity">Sort by Popularity</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 gap-6">
                {filteredProducts.map((product) => (
                  <DefaultProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>

            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}