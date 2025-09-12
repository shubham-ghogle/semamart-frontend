// Wishlist.tsx

import { Link } from "react-router-dom";
import { IoHeart } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { useWishlistStore } from "../../store/wishlistStore";
import { useCartStore } from "../../store/cartStore";
import { Product } from "../../Types/types";

type WishlistProps = {
  wishlistOpenHandler: () => void;
};

export default function Wishlist({ wishlistOpenHandler }: WishlistProps) {
  const wishlist = useWishlistStore((s) => s.wishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  return (
    <article className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl rounded-l-3xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-500 to-red-500">
          <div className="flex items-center gap-2 text-white">
            <IoHeart size={28} />
            <h2 className="text-2xl font-bold">
              {wishlist.length} item{wishlist.length !== 1 && "s"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Clear All */}
            <button
              onClick={clearWishlist}
              disabled={wishlist.length === 0}
              className="px-3 py-1 text-sm font-semibold bg-white/20 text-white rounded-full hover:bg-white/30 transition disabled:opacity-50"
            >
              Clear All
            </button>
            {/* Close */}
            <button
              onClick={wishlistOpenHandler}
              className="p-1 rounded-full hover:bg-white/20 transition"
              aria-label="Close wishlist"
            >
              <RxCross1 size={24} className="text-white" />
            </button>
          </div>
        </header>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center px-8 text-gray-500">
            <div className="text-6xl mb-4 animate-pulse">💔</div>
            <h3 className="text-xl font-semibold mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-center">
              Browse products and save your favorites for later.
            </p>
            <button
              onClick={() => {
                wishlistOpenHandler();
                window.location.href = "/";
              }}
              className="bg-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-600 transition"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 p-4 space-y-4">
            {wishlist.map((product) => (
              <WishlistItem key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

type WishlistItemProps = {
  product: Product;
};

function WishlistItem({ product }: WishlistItemProps) {
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const addToCart = useCartStore((s) => s.addToCart);

  // ✅ Image from backend
  const imageUrl =
    product.images?.[0] ? `/images/${product.images[0]}` : "/placeholder.png";

  // ✅ Handle price (fallback to first variant)
  const firstVariant = product.variants?.[0];
  const price =
    firstVariant?.discountPrice ??
    firstVariant?.originalPrice ??
    0;

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow-md p-3 hover:shadow-lg transition">
      {/* Product Link & Image */}
      <Link
        to={`/product/${product._id}`}
        className="flex items-center gap-4 flex-1"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-20 h-20 object-cover rounded-lg border"
        />
        <div className="flex flex-col flex-1">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            ₹{price.toLocaleString()}
          </p>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2">
        {/* Add to Cart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart({ product, qty: 1 });
            removeFromWishlist(product._id);
          }}
          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
        >
          Add to Cart
        </button>

        {/* Remove from Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            removeFromWishlist(product._id);
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Remove from wishlist"
        >
          <RxCross1
            size={20}
            className="text-gray-500 hover:text-red-500 transition"
          />
        </button>
      </div>
    </div>
  );
}
