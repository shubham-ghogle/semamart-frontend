import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Product } from "../../Types/types";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
//const BASE_URL = "http://localhost:8000";

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
    <div>search result page</div>
  );
}
