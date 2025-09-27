// WishlistPage.tsx
import { Link } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { useWishlistStore, WishlistItem } from "../../store/wishlistStore";
import { useCartStore } from "../../store/cartStore";
import RelatedProducts from "../../components/UIComponents/RelatedProductCard";

export default function WishlistPage() {
  const wishlist = useWishlistStore((s) => s.wishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const addToCart = useCartStore((s) => s.addToCart);

  return (
    <main className="flex-1 p-6 bg-white shadow-lg font-montserrat m-6">
      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            My Wishlist ({wishlist.length})
          </h2>
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
            <h3 className="text-lg font-semibold mb-2">
              Your wishlist is empty
            </h3>
            <p className="mb-4">
              Browse products and save your favorites for later.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#1C647C] text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-600 transition"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          wishlist.map((item: WishlistItem) => {
            const { product, variant, price, productId, variantId } = item;

            const discount =
              variant?.originalPrice && variant?.discountPrice
                ? Math.round(
                    ((variant.originalPrice - variant.discountPrice) /
                      variant.originalPrice) *
                      100
                  )
                : 0;

            return (
              <div
                key={`${productId}-${variantId ?? "no-variant"}`}
                className="flex items-start gap-4 px-6 py-4 border-b hover:bg-gray-50 group"
              >
                {/* Product Image */}
                <Link
                  to={`/product/${productId}`}
                  className="w-24 h-24 shrink-0"
                >
                  <img
                    src={
                      variant?.thumbnail
                        ? `/images/${variant.thumbnail}`
                        : product.images?.[0]
                        ? `/images/${product.images[0]}`
                        : "/placeholder.png"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover rounded border"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1">
                  <Link to={`/product/${productId}`}>
                    <h3 className="font-medium text-gray-900 hover:text-blue-600 transition">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price Info */}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{price.toLocaleString()}
                    </span>
                    {variant?.originalPrice && (
                      <span className="line-through text-gray-500 text-sm">
                        ₹{variant.originalPrice.toLocaleString()}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="text-green-600 text-sm font-medium">
                        {discount}% off
                      </span>
                    )}
                  </div>

                  {/* Availability */}
                  {!variant?.stock && (
                    <p className="text-sm text-red-500 font-medium mt-1">
                      Currently unavailable
                    </p>
                  )}

                  {/* Add to Cart Button (original size, buy now style) */}
                  {variant?.stock && (
                    <button
                      onClick={() => {
                        addToCart({
                          productId,
                          variantId,
                          product,
                          variant,
                          qty: 1,
                          price, // per-piece price
                          shopId:
                            typeof (product as any).shopId === "string"
                              ? (product as any).shopId
                              : (product as any).shopId?._id ?? "",
                          taxClass: product.taxClass ?? 0,
                        });
                        removeFromWishlist(productId, variantId ?? null);
                      }}
                      className="mt-3 inline-block text-white text-sm font-semibold px-4 py-1.5 rounded transition shadow"
                      style={{
                        background:
                          "linear-gradient(270deg, #FCB320 0%, #F04526 100%)",
                      }}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>

                {/* Remove from Wishlist */}
                <button
                  onClick={() =>
                    removeFromWishlist(productId, variantId ?? null)
                  }
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  title="Remove from Wishlist"
                >
                  <RxCross1
                    className="text-gray-400 group-hover:text-red-500 transition"
                    size={18}
                  />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Related Products */}
      {wishlist.length > 0 && (
        <div className="space-y-8 mt-12 w-full max-w-[1600px] mx-auto px-4">
          <hr className="border-t border-gray-400" />
          <h2 className="font-bold text-2xl mt-6 ml-2 text-[#1C647C]">
            Related Products
          </h2>
          <div className="flex flex-wrap justify-around mt-8">
            <RelatedProducts
              productType={(wishlist[0].product as any).productType}
              productId={(wishlist[0].product as any)._id}
            />
          </div>
        </div>
      )}
    </main>
  );
}
