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
    <main className="flex-1 min-h-screen bg-gray-50 py-4 md:py-8 lg:py-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4 md:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              My Wishlist <span className="text-gray-400 font-normal">({wishlist.length})</span>
            </h2>
            {wishlist.length > 0 && (
              <button
                onClick={clearWishlist}
                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Wishlist Items */}
          {wishlist.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4 animate-bounce">💔</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                Looks like you haven't added anything to your wishlist yet.
              </p>
              <Link
                to="/"
                className="inline-block bg-[#1C647C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#154d60] transition-transform active:scale-95 shadow-lg"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {wishlist.map((item: WishlistItem) => {
                const { product, variant, price, productId, variantId } = item;
                const discount = variant?.originalPrice && variant?.discountPrice
                  ? Math.round(((variant.originalPrice - variant.discountPrice) / variant.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={`${productId}-${variantId ?? "no-variant"}`}
                    className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 md:p-6 hover:bg-gray-50 transition-colors relative group"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/product/${productId}`}
                      className="w-full sm:w-32 h-40 sm:h-32 shrink-0 overflow-hidden rounded-lg border border-gray-100"
                    >
                      <img
                        src={variant?.thumbnail ? `/images/${variant.thumbnail}` : product.images?.[0] ? `/images/${product.images[0]}` : "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 w-full text-center sm:text-left">
                      <Link to={`/product/${productId}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-[#1C647C] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price Info */}
                      <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        {variant?.originalPrice && (
                          <span className="line-through text-gray-400 text-sm">
                            ₹{variant.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      {/* Availability & Actions */}
                      <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                        {variant?.stock ? (
                          <button
                            onClick={() => {
                              addToCart({
                                productId,
                                variantId,
                                product,
                                variant,
                                qty: 1,
                                price,
                                shopId: typeof (product as any).shopId === "string" ? (product as any).shopId : (product as any).shopId?._id ?? "",
                                taxClass: product.taxClass ?? 0,
                              });
                              removeFromWishlist(productId, variantId ?? null);
                            }}
                            className="w-full sm:w-auto px-6 py-2 rounded-lg text-white font-bold text-sm transition-all shadow-md active:scale-95"
                            style={{ background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)" }}
                          >
                            Move to Cart
                          </button>
                        ) : (
                          <span className="text-sm text-red-500 font-bold bg-red-50 px-3 py-1 rounded">Out of Stock</span>
                        )}
                      </div>
                    </div>

                    {/* Remove Button - Top right on mobile, standard on desktop */}
                    <button
                      onClick={() => removeFromWishlist(productId, variantId ?? null)}
                      className="absolute top-2 right-2 sm:static p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <RxCross1 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {wishlist.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-[#1C647C] whitespace-nowrap">Related Products</h2>
              <div className="h-px bg-gray-200 w-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <RelatedProducts
                productType={(wishlist[0].product as any).productType}
                productId={(wishlist[0].product as any)._id}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}