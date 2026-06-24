import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Product } from "../../Types/types";
import DefaultProductCard from "../../components/Product/ProductCard";
import { API_URL } from "@/data";

export default function ProductBasedOnSpecialPackage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularity");
  const [selectedManufacturerName, setSelectedManufacturerName] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);

  const { id } = useParams<{ id: string }>();

  // ---------------- FETCH (same structure as category) ----------------
  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) {
        setLoading(false);
        setError("Invalid speciality package ID");
        return;
      }
      try {
        const res = await fetch(
          `${API_URL}product/get-products-by-speciality-package/${id}`
        );
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        if (Array.isArray(data)) {
          // 🔥 SAME manufacturer normalization as category page
          const fixedProducts = data.map((p: any) => {
            if (!p.manufacturer && p.manufacturerName) {
              p.manufacturer = {
                manufacturerName: p.manufacturerName,
                email: p.email || "",
                phone: p.phone || "",
                origin: p.origin || "",
              };
            }
            return p;
          });

          setProducts(fixedProducts);
          setError(null);
        } else {
          setProducts([]);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  // ---------------- HELPERS (same as category) ----------------
  const getManufacturerName = (p: Product) =>
    typeof p.manufacturer === "string"
      ? p.manufacturer
      : p.manufacturer?.manufacturerName ?? "Unknown";

  const allManufacturerNames = [
    ...new Set(products.map(getManufacturerName)),
  ].filter(Boolean);

  const handleBrandChange = (manufacturerName: string) => {
    setSelectedManufacturerName((prev) =>
      prev.includes(manufacturerName)
        ? prev.filter((b) => b !== manufacturerName)
        : [...prev, manufacturerName]
    );
  };

  // ---------------- FILTER & SORT (same as category) ----------------
  const filteredProducts = products
    .filter((p) => {
      const firstVariant = p.variants?.[0];
      const price =
        firstVariant?.discountPrice ??
        firstVariant?.originalPrice ??
        0;

      const matchesSearch = p.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesBrand =
        selectedManufacturerName.length === 0 ||
        selectedManufacturerName.includes(getManufacturerName(p));

      const matchesMinPrice = minPrice === "" || price >= minPrice;
      const matchesMaxPrice = maxPrice === "" || price <= maxPrice;

      return (
        matchesSearch &&
        matchesBrand &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    })
    .sort((a, b) => {
      const getPrice = (p: Product) =>
        p.variants?.[0]?.discountPrice ??
        p.variants?.[0]?.originalPrice ??
        0;

      if (sort === "priceLow") return getPrice(a) - getPrice(b);
      if (sort === "priceHigh") return getPrice(b) - getPrice(a);
      if (sort === "ratingHigh")
        return (b.ratings ?? 0) - (a.ratings ?? 0);

      if (sort === "discountHigh") {
        const getDiscount = (p: Product) => {
          const v = p.variants?.[0];
          const original = v?.originalPrice ?? 1;
          const discounted = v?.discountPrice ?? original;
          return ((original - discounted) / Math.max(original, 1)) * 100;
        };
        return getDiscount(b) - getDiscount(a);
      }
      return 0;
    });

  // ---------------- STATES ----------------
  if (loading)
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-lg">Loading products...</p>
        </div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-red-600 text-lg">Error: {error}</p>
        </div>
        <Footer />
      </>
    );

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Mobile filter toggle */}
      <div className="md:hidden bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="px-3 py-2 rounded-md border text-sm"
          >
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300
md:relative md:translate-x-0 md:w-64 md:z-1 border-r p-5 ${
            showFilters ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">Filters</h3>

          {/* Brand */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Brand</h4>
            {allManufacturerNames.map((brand) => (
              <label key={brand} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={selectedManufacturerName.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="mr-2"
                />
                {brand}
              </label>
            ))}
          </div>

          {/* Price */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Price Range</h4>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="border px-3 py-2 rounded w-full mb-2"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Search */}
          <div>
            <h4 className="font-medium mb-2">Search</h4>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-8">
          <div className="flex justify-end mb-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border px-3 py-2 rounded-md"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="priceLow">Price -- Low to High</option>
              <option value="priceHigh">Price -- High to Low</option>
              <option value="ratingHigh">Rating -- High to Low</option>
              <option value="discountHigh">Highest Discount</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <DefaultProductCard key={product._id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              No products found.
            </p>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
