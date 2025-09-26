import { Product } from "@/Types/types"
import { Star } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useWishlistStore } from "@/store/wishlistStore"
import { Link } from "react-router"
import { toast } from "react-toastify"

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  // ✅ Always pick first variant (or best variant logic later)
  const variant = product.variants?.[0]

  const originalPrice = variant?.originalPrice ?? null
  const discountPrice = variant?.discountPrice ?? null
  const stock = variant?.stock ?? 0

  const discountPercent =
    originalPrice && discountPrice
      ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
      : 0

  // ✅ new (prefer product.images)
const imageUrl = product.images?.[0]
  ? `/images/${product.images[0]}`
  : variant?.thumbnail
  ? `/images/${variant.thumbnail}`
  : "/placeholder.png"


  // Zustand stores
  const addToCart = useCartStore((s) => s.addToCart)
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s)
  const inWishlist = wishlist.some((p) => p._id === product._id)

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!variant || stock <= 0) return

    addToCart({
      productId: product._id,
      variantId: variant._id,
      product,
      variant,
      qty: 1,
      shopId: (product as any).shopId?._id || (product as any).shopId,
    })

    if (inWishlist) removeFromWishlist(product._id)

    toast.success(`${product.name} added to cart!`, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product)
  }

  return (
    <div className="border rounded-lg bg-white hover:shadow-lg transition-all duration-200 overflow-hidden w-[220px] relative">
      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-2 right-2 z-10 hover:scale-110 transition-transform"
        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200">
          <span
            className="w-4 h-4 inline-block transition duration-200"
            style={{
              WebkitMaskImage: "url('/heart_icon.png')",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              WebkitMaskSize: "contain",
              maskImage: "url('/heart_icon.png')",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              maskSize: "contain",
              backgroundColor: inWishlist ? "#DF848E" : "#1C647C",
            }}
          />
        </span>
      </button>

      {/* Whole card clickable */}
      <Link to={`/product/${product._id}`} className="block">
        {/* Image */}
        <div className="h-48 flex items-center justify-center bg-gray-50 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.png"
            }}
          />
        </div>

        {/* Content */}
        <div className="px-3 py-2 flex flex-col gap-1">
          {/* Name */}
          <h3 className="text-sm font-medium line-clamp-2 h-10 text-gray-800">
            {product.name}
          </h3>

          {/* Ratings
          {product.ratings ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-green-600 text-white px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 font-medium">
                {product.ratings.toFixed(1)}
                <Star className="w-3 h-3 fill-white text-white" />
              </span>
              <span className="text-gray-500">
                ({product.reviews?.length || 0})
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-500">No ratings</span>
          )} */}

          {/* Price */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-semibold text-gray-900">
              ₹{discountPrice || originalPrice || "—"}
            </span>
            {discountPrice && originalPrice && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  ₹{originalPrice}
                </span>
                {discountPercent > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    {discountPercent}% off
                  </span>
                )}
              </>
            )}
          </div>

          {/* Stock + Cart */}
          <div className="flex items-center justify-between mt-2">
            {stock !== undefined && (
              <span
                className={`text-xs ${
                  stock > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {stock > 0 ? `${stock} in stock` : "Out of stock"}
              </span>
            )}

            {stock > 0 && (
              <button
                onClick={handleAddCart}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1C647C] hover:bg-[#004C4D] text-white font-bold text-lg"
                title="Add to Cart"
              >
                <img src="/st_icon.png" alt="Cart" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
