import { Link } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { useWishlistStore } from "../../store/wishlistStore";
import { useCartStore } from "../../store/cartStore";


export default function WishlistPage() {
  const wishlist = useWishlistStore((s) => s.wishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const addToCart = useCartStore((s) => s.addToCart);

  return ( 
    <main className="flex-1 p-6 bg-white shadow-lg font-montserrat m-6 ">
      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">My Wishlist ({wishlist.length})</h2>
          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-sm text-red-500 hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlist.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-4xl mb-4 animate-pulse">💔</p>
            <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
            <p className="mb-4">Browse products and save your favorites for later.</p>
            <Link
              to="/"
              className="inline-block bg-[#1C647C] text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-600 transition"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          wishlist.map((product) => {
            const variant = product.variants?.[0];
            if (!variant) return null;

            const discount = variant.originalPrice && variant.discountPrice
              ? Math.round(((variant.originalPrice - variant.discountPrice) / variant.originalPrice) * 100)
              : 0;

            return (
              <div
                key={product._id}
                className="flex items-start gap-4 px-6 py-4 border-b hover:bg-gray-50 group"
              >
                {/* Product Image */}
                <Link to={`/product/${product._id}`} className="w-24 h-24 shrink-0">
                  <img
                   src={product.variants[0].thumbnail || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-full object-cover rounded border"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-medium text-gray-900 hover:text-blue-600 transition">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price Info */}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{product.variants[0].discountPrice ? product.variants[0].discountPrice.toLocaleString() : "N/A"}
                    </span>
                    <span className="line-through text-gray-500 text-sm">
                       ₹{product.variants[0].originalPrice ? product.variants[0].originalPrice.toLocaleString() : "N/A"}
                    </span>
                    <span className="text-green-600 text-sm font-medium">{discount}% off</span>
                  </div>

                  {/* Availability */}
                  {!product.variants[0].stock && (
                    <p className="text-sm text-red-500 font-medium mt-1">
                      Currently unavailable
                    </p>
                  )}

                  {/* Add to Cart Button */}
                  {product.variants[0].stock && (
                    <button
                      onClick={() => {
                        addToCart({ product, qty: 1 });
                        removeFromWishlist(product._id);
                      }}
                      className="mt-3 inline-block bg-green-500 text-white text-sm font-semibold px-4 py-1.5 rounded hover:bg-green-600 transition"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>

                {/* Remove from Wishlist */}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  title="Remove from Wishlist"
                >
                  <RxCross1 className="text-gray-400 group-hover:text-red-500 transition" size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
