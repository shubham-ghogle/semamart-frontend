import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Product } from "../../Types/types";
import DefaultProductCard from "../../components/Product/ProductCard";
import { API_URL } from "@/data";

export default function ProductBasedOnType() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularity");
  const [selectedManufacturerName, setSelectedManufacturerName] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const { id } = useParams<{ id: string }>();

  // Fetch products by subcategory ID
  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) {
        setLoading(false);
        setError("Invalid category ID");
        return;
      }
      try {
        const res = await fetch(`${API_URL}product/get-products-by-subcategory/${id}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        if (Array.isArray(data)) {
          // normalize manufacturer object
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

  // Helper: manufacturer name
  const getManufacturerName = (p: Product) =>
    typeof p.manufacturer === "string"
      ? p.manufacturer
      : p.manufacturer?.manufacturerName ?? "Unknown";

  // Unique brands
  const allManufacturerNames = [...new Set(products.map(getManufacturerName))];

  // Brand toggle
  const handleBrandChange = (manufacturerName: string) => {
    setSelectedManufacturerName((prev) =>
      prev.includes(manufacturerName)
        ? prev.filter((b) => b !== manufacturerName)
        : [...prev, manufacturerName]
    );
  };

  // Filtered & sorted products
  const filteredProducts = products
    .filter((p) => {
      const firstVariant = p.variants?.[0];
      const price = firstVariant?.discountPrice ?? firstVariant?.originalPrice ?? 0;

      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesBrand =
        selectedManufacturerName.length === 0 ||
        selectedManufacturerName.includes(getManufacturerName(p));
      const matchesMinPrice = minPrice === "" || price >= minPrice;
      const matchesMaxPrice = maxPrice === "" || price <= maxPrice;

      return matchesSearch && matchesBrand && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      const getPrice = (p: Product) =>
        p.variants?.[0]?.discountPrice ?? p.variants?.[0]?.originalPrice ?? 0;

      if (sort === "priceLow") return getPrice(a) - getPrice(b);
      if (sort === "priceHigh") return getPrice(b) - getPrice(a);
      if (sort === "ratingHigh") return (b.ratings ?? 0) - (a.ratings ?? 0);

      if (sort === "discountHigh") {
        const getDiscount = (p: Product) => {
          const v = p.variants?.[0];
          const original = v?.originalPrice ?? 1;
          const discounted = v?.discountPrice ?? original;
          return ((original - discounted) / original) * 100;
        };
        return getDiscount(b) - getDiscount(a);
      }
      return 0;
    });

  if (loading)
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading products...</p>
        </div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-red-600 text-lg">Error: {error}</p>
        </div>
        <Footer />
      </>
    );

  return (
    <div>
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-sm">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r p-4 md:sticky md:top-0 md:h-screen shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Filters</h2>

          {/* Brand Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Brand</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {allManufacturerNames.length > 0 ? (
                allManufacturerNames.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center text-gray-600 hover:text-[#1C647C] cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedManufacturerName.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="mr-2 accent-[#1C647C]"
                    />
                    {brand}
                  </label>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No brands available</p>
              )}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Price Range</h3>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-[#1C647C]"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-[#1C647C]"
              />
            </div>
          </div>

          {/* Search */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Search</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded text-sm w-full focus:ring-2 focus:ring-[#1C647C]"
            />
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Products</h2>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border px-3 py-2 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-[#1C647C]"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="priceLow">Price -- Low to High</option>
              <option value="priceHigh">Price -- High to Low</option>
              <option value="ratingHigh">Rating -- High to Low</option>
              <option value="discountHigh">Highest Discount</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <DefaultProductCard key={product._id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-500 mt-10 text-base">
              No products found. Try adjusting filters.
            </p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
