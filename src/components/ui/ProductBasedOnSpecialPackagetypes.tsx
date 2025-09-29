import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai";


// ✅ Define Variant type
type Variant = {
  discountPrice: number;
  originalPrice: number;
};

// ✅ Product type
type Product = {
  id: string;
  name: string;
  manufacturerName: string;
  originalPrice: number;
  discountPrice: number;
  deliveryDate?: string;
  rating?: number;
  image: string;
  badge?: string;
  variants: Variant[];
};

export default function ProductBasedOnSpecialPackagetypes() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const [searchInput] = useState("");
  const [search] = useState("");
  const [sort, setSort] = useState("popularity");
  const [selectedmanufacturerName, setSelectedmanufacturerName] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [cartItems, setCartItems] = useState<string[]>([]);

  const { id } = useParams<{ id: string }>();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/v2/product/get-products-by-speciality-package-type/${id}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          setError(null);
        } else if (typeof data === "object" && data.message) {
          setProducts([]);
          setError(null);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  // Unique brands
  const allmanufacturerName = [...new Set(products.map((p) => p.manufacturerName))];

  const handleBrandChange = (manufacturerName: string) => {
    setSelectedmanufacturerName((prev) =>
      prev.includes(manufacturerName) ? prev.filter((b) => b !== manufacturerName) : [...prev, manufacturerName]
    );
  };

  const handleAddToCart = (productId: string) => {
    if (!cartItems.includes(productId)) {
      setCartItems((prev) => [...prev, productId]);
      alert("Product added to cart!");
    } else {
      alert("Product already in cart");
    }
  };

 

  // Filter & sort
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesBrand =
        selectedmanufacturerName.length === 0 || selectedmanufacturerName.includes(p.manufacturerName);

      const price = p.variants?.[0]?.discountPrice ?? p.discountPrice;
      const matchesMinPrice = minPrice === "" || price >= minPrice;
      const matchesMaxPrice = maxPrice === "" || price <= maxPrice;

      return matchesSearch && matchesBrand && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      const getPrice = (p: Product) => p.variants?.[0]?.discountPrice ?? p.discountPrice;

      if (sort === "priceLow") return getPrice(a) - getPrice(b);
      if (sort === "priceHigh") return getPrice(b) - getPrice(a);
      if (sort === "ratingHigh") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === "deliverySoon") {
        const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : Infinity;
        const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : Infinity;
        return dateA - dateB;
      }
      if (sort === "discountHigh") {
        const getDiscount = (p: Product) => {
          const original = p.variants?.[0]?.originalPrice ?? p.originalPrice;
          const discounted = p.variants?.[0]?.discountPrice ?? p.discountPrice;
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
      <div className="flex min-h-screen bg-gray-50 text-sm">
        {/* Sidebar */}
        <aside className="w-60 hidden md:block bg-white border-r p-4">
          <h2 className="font-semibold mb-4">Filters</h2>

          {/* Brand Filter */}
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-1">Brand</h3>
            {allmanufacturerName.length > 0 ? (
              allmanufacturerName.map((manufacturerName) => (
                <label key={manufacturerName} className="block text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedmanufacturerName.includes(manufacturerName)}
                    onChange={() => handleBrandChange(manufacturerName)}
                    className="mr-2"
                  />
                  {manufacturerName}
                </label>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No brands available</p>
            )}
          </div>

          {/* Price Filter */}
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-1">Price Range</h3>
            <div className="flex flex-col space-y-2">
              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="border px-2 py-1 rounded text-sm"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="border px-2 py-1 rounded text-sm"
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {/* Top Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border px-3 py-2 rounded w-full md:w-1/4"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="priceLow">Price -- Low to High</option>
              <option value="priceHigh">Price -- High to Low</option>
              <option value="ratingHigh">Rating -- High to Low</option>
              <option value="deliverySoon">Earliest Delivery</option>
              <option value="discountHigh">Highest Discount</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const variant = product.variants?.[0];
              const discount = variant
                ? Math.floor(((variant.originalPrice - variant.discountPrice) / variant.originalPrice) * 100)
                : Math.floor(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);

              return (
                <div
                  key={product.id}
                  className="relative bg-white border rounded-lg shadow-sm hover:shadow-md p-2 flex flex-col"
                >
                  <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                    aria-label="Add to wishlist"
                  >
                    <AiOutlineHeart size={20} />
                  </button>

                  <img src={product.image} alt={product.name} className="w-full h-48 object-contain" />

                  <h3 className="mt-2 font-semibold text-sm">{product.name}</h3>
                  <p className="text-gray-500 text-xs">{product.manufacturerName}</p>

                  <div className="mt-1">
                    <span className="text-base font-bold">
                      ₹{variant?.discountPrice ?? product.discountPrice}
                    </span>
                    <span className="line-through text-sm text-gray-400 ml-2">
                      ₹{variant?.originalPrice ?? product.originalPrice}
                    </span>
                    <span className="text-green-600 text-sm ml-2">{discount}% off</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="mt-auto flex items-center justify-center gap-2 bg-[#1C647C]  text-white rounded px-3 py-2 hover:bg-blue-700 transition"
                  >
                    <AiOutlineShoppingCart size={18} />
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No products found.</p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
