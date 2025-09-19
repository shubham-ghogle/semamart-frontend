import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ImageSliderHome from "../../components/Homepage/ImageSliderHome";
import { AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai";

// ✅ Define Variant type
type Variant = {
  discountPrice: number;
  originalPrice: number;
  // Add other variant-specific fields if needed
};

// ✅ Updated Product type to include Variant[]
type Product = {
  id: string;
  name: string;
  brand: string;
  originalPrice: number;
  discountPrice: number;
  deliveryDate?: string;
  rating?: number;
  image: string;
  badge?: string;
  variants: Variant[];
};

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularity");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const { id } = useParams<{ id: string }>();


  // Fetch products on mount
useEffect(() => {
  const fetchProducts = async () => {
    if (!id) return;

    try {
      const res = await fetch(`/api/v2/product/get-products-by-subcategory/${id}`);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setProducts(data);
        setError(null); // clear any previous errors
      } else if (typeof data === "object" && data.message) {
        setProducts([]); // Treat as no products
        setError(null);  // ✅ Don't show this as an error
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




  // Extract unique brands
  const allBrands = [...new Set(products.map((p) => p.brand))];

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
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

  const handleSearchClick = () => {
    setSearch(searchInput);
  };

  // Filter and sort
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      return matchesSearch && matchesBrand;
    })
    .sort((a, b) => {
      if (sort === "priceLow") return a.discountPrice - b.discountPrice;
      if (sort === "priceHigh") return b.discountPrice - a.discountPrice;
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
        {/* Sidebar Filters */}
        <aside className="w-60 hidden md:block bg-white border-r p-4">
          <h2 className="font-semibold mb-4">Filters</h2>
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-1">Brand</h3>
            {allBrands.length > 0 ? (
              allBrands.map((brand) => (
                <label key={brand} className="block text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="mr-2"
                  />
                  {brand}
                </label>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No brands available</p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {/* Top Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border px-3 py-2 rounded w-full md:w-1/4"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="priceLow">Price -- Low to High</option>
              <option value="priceHigh">Price -- High to Low</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const variant = product.variants?.[0]; // ✅ Safe access

              const discount = variant
                ? Math.floor(
                    ((variant.originalPrice - variant.discountPrice) / variant.originalPrice) * 100
                  )
                : Math.floor(
                    ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
                  );

              return (
                <div
                  key={product.id}
                  className="relative bg-white border rounded-lg shadow-sm hover:shadow-md p-2 flex flex-col"
                >
                  {/* Wishlist Icon */}
                  <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                    aria-label="Add to wishlist"
                  >
                    <AiOutlineHeart size={20} />
                  </button>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-contain"
                  />

                  <h3 className="mt-2 font-semibold text-sm">{product.name}</h3>
                  <p className="text-gray-500 text-xs">{product.brand}</p>

                  <div className="mt-1">
                    {variant ? (
                      <>
                        <span className="text-base font-bold">₹{variant.discountPrice}</span>
                        <span className="line-through text-sm text-gray-400 ml-2">
                          ₹{variant.originalPrice}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-base font-bold">₹{product.discountPrice}</span>
                        <span className="line-through text-sm text-gray-400 ml-2">
                          ₹{product.originalPrice}
                        </span>
                      </>
                    )}
                    <span className="text-green-600 text-sm ml-2">{discount}% off</span>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="mt-auto flex items-center justify-center gap-2 bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700 transition"
                    aria-label={`Add ${product.name} to cart`}
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
