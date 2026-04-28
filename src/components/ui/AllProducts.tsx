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
  const [search, setSearch] = useState("");
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

  // --- Data Processing ---
  const getProductPrice = (p: Product) => {
    const v = p.variants?.[0];
    return v?.discountPrice ?? v?.originalPrice ?? 0;
  };

  const getManufacturerName = (p: Product) => {
    if (!p.manufacturer) return "Unknown";
    return typeof p.manufacturer === "object" ? p.manufacturer.manufacturerName || "Unknown" : p.manufacturer;
  };

  const allManufacturerNames = useMemo(() => {
    return [...new Set(products.map(getManufacturerName).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const price = getProductPrice(p);
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesBrand = selectedManufacturerName.length === 0 || selectedManufacturerName.includes(getManufacturerName(p));
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

  if (loading || error) return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">{loading ? "Loading..." : error}</div>
    </div>
  );

  return (
    // 1. Root container: fixed height, no scroll
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Header />

      {/* 2. Main content area: fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 3. SIDEBAR: Own scrollbar only if content overflows */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300
            md:translate-x-0 md:static md:w-64 border-r p-5 
            flex flex-col h-full overflow-y-auto
            ${showFilters ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="md:hidden flex justify-end"><button onClick={() => setShowFilters(false)}>✕</button></div>
          <h3 className="text-lg font-bold mb-6">Filters</h3>
          
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-4">Brand</h4>
            <div className="space-y-3">
              {allManufacturerNames.map(brand => (
                <label key={brand} className="flex items-center text-sm cursor-pointer hover:text-cyan-700">
                  <input type="checkbox" className="mr-3 accent-cyan-700" onChange={() => {
                    setSelectedManufacturerName(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
                  }} />
                  {brand}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-4">Price Range</h4>
            <input type="number" placeholder="Min" className="w-full border p-2 rounded mb-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} />
            <input type="number" placeholder="Max" className="w-full border p-2 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>
        </aside>

        {/* 4. PRODUCT GRID: This is the only part that should scroll the products */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 md:p-8 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold">Products ({filteredProducts.length})</h2>
               <select value={sort} onChange={(e) => setSort(e.target.value)} className="border p-2 rounded text-sm bg-white">
                  <option value="popularity">Sort by Popularity</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
               </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 gap-6">
              {filteredProducts.map((product) => (
                <DefaultProductCard key={product._id} product={product} />
              ))}
            </div>
            
            {/* Footer inside the scrollable area so it appears at the end of the list */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}