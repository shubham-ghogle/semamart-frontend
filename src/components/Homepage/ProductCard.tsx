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
  const variant = product.variants?.[0]

  const originalPrice = variant?.originalPrice ?? null
  const discountPrice = variant?.discountPrice ?? null
  const stock = variant?.stock ?? 0

  const discountPercent =
    originalPrice && discountPrice
      ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
      : 0

  const imageUrl = product.images?.[0]
    ? `/images/${product.images[0]}`
    : variant?.thumbnail
    ? `/images/${variant.thumbnail}`
    : "/placeholder.png"

  // Zustand stores
  const addToCart = useCartStore((s) => s.addToCart)
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s)

  // ✅ Safe inWishlist check (wishlist item stores product object)
  const inWishlist = wishlist.some(
    (w: any) => w.product?._id === product._id || w.productId === product._id
  )

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!variant || stock <= 0) return

    const perPiecePrice =
      variant.discountPrice ?? variant.originalPrice ?? 0

    addToCart({
      productId: product._id,
      variantId: variant._id,
      product,
      variant,
      qty: 1,
      price: perPiecePrice, // ✅ required field
      shopId: (product as any).shopId?._id || (product as any).shopId,
      taxClass: (product as any).taxClass ?? 0,
    })

    if (inWishlist) removeFromWishlist(product._id, variant._id)

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
    inWishlist
      ? removeFromWishlist(product._id, variant?._id ?? null)
      : addToWishlist(product, variant ?? null)
  }

  return (
    <div className="border rounded-lg bg-white hover:shadow-lg transition-all duration-200 overflow-hidden w-[220px] relative">
      {/* Discount Bar */}
      {discountPercent > 0 && (
        <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          {discountPercent}% OFF
        </div>
      )}

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

          {/* Ratings */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < 3
                    ? "fill-yellow-500 text-yellow-500"
                    : "fill-gray-300 text-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-semibold text-gray-900">
              ₹{discountPrice || originalPrice || "—"}
            </span>
            {discountPrice && originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>

          {/* Cart + Wishlist at bottom */}
          <div className="flex items-center justify-between mt-2">
            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className="hover:scale-110 transition-transform"
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

            {/* Cart */}
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
