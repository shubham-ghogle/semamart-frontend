import React from "react";
import { Product } from "@/Types/types";
import { Star, ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

interface Props {
  product: Product;
}

const PLACEHOLDER = "/placeholder.png";

export default function ProductCard({ product }: Props) {
  const variant = product.variants?.[0] ?? null;

  // prices (use nullish to allow 0)
  const originalPrice: number | null =
    variant?.originalPrice != null ? variant.originalPrice : null;
  const discountPrice: number | null =
    variant?.discountPrice != null ? variant.discountPrice : null;
  const stock: number = variant?.stock ?? 0;

  // discount percent: only when originalPrice > 0 and discountPrice is a valid number lower than original
  let discountPercent: number = 0;
  if (
    typeof originalPrice === "number" &&
    originalPrice > 0 &&
    typeof discountPrice === "number" &&
    discountPrice < originalPrice
  ) {
    const rawPercent = ((originalPrice - discountPrice) / originalPrice) * 100;
    discountPercent = Number(rawPercent.toFixed(2)); // keeps up to 2 decimals and trims trailing zeros
  }

  // image selection (product.images is prioritized)
  const imageUrl =
    (product.images && product.images.length > 0 && `/images/${product.images[0]}`) ||
    (variant?.thumbnail && `/images/${variant.thumbnail}`) ||
    PLACEHOLDER;

  // wishlist + cart stores
  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s);

  const inWishlist = wishlist.some(
    (w: any) => (w.product && (w.product as any)._id === product._id) || w.productId === product._id
  );

  const handleAddCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant || (variant.stock ?? 0) <= 0) {
      toast.error("Out of stock", { position: "top-center", autoClose: 1500 });
      return;
    }

    const perPiecePrice = discountPrice ?? originalPrice ?? 0;

    addToCart({
      productId: product._id,
      variantId: variant._id,
      product,
      variant,
      qty: 1,
      price: perPiecePrice,
      shopId: (product as any).shopId?._id || (product as any).shopId,
      taxClass: (product as any).taxClass ?? 0,
    });

    if (inWishlist) removeFromWishlist(product._id, variant._id);

    toast.success(`${product.name} added to cart!`, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product._id, variant?._id ?? null);
      toast.info("Removed from wishlist", { position: "top-center", autoClose: 1200 });
    } else {
      addToWishlist(product, variant ?? null);
      toast.success("Added to wishlist", { position: "top-center", autoClose: 1200 });
    }
  };

  // ratings (0..5). Handle undefined gracefully.
  const ratingRaw = typeof product.ratings === "number" ? product.ratings : 0;
  const rating = Math.min(Math.max(Math.round(ratingRaw), 0), 5);

  // category string (product.category is an array)
  const categoryLabel =
    Array.isArray(product.category) && product.category.length > 0
      ? product.category[0]
      : typeof product.category === "string"
      ? product.category
      : "General";

  return (
    <div className="group relative border rounded-xl bg-white hover:shadow-lg transition-all duration-300 overflow-hidden md:w-[220px] w-full md:h-[340px]">
      {/* Discount Badge */}
      {discountPercent >= 0 && (
        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md z-10">
          {discountPercent}% OFF
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 hover:scale-110 transition-transform"
        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        aria-pressed={inWishlist}
      >
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
      </button>

      {/* Whole card clickable */}
      <Link to={`/product/${product._id}`} className="block h-full">
        {/* Image Section */}
        <div className="md:h-[190px] h-56 flex items-center justify-center bg-gray-50 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-[90%] max-w-[90%] object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
            }}
          />
        </div>

        {/* Text Section */}
        <div
          className={
            "w-full bg-white px-3 pb-3 pt-2 transition-all duration-300 transform " +
            "md:absolute md:bottom-[10px] md:left-0 md:w-full md:bg-white " +
            "md:translate-y-0 md:group-hover:-translate-y-10"
          }
        >
          <h3 className="text-sm font-medium text-gray-800 truncate">{product.name}</h3>
          <p className="text-xs text-gray-500 truncate capitalize">{categoryLabel}</p>

          <div className="flex items-center gap-1 mt-1" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">({ratingRaw ?? 0})</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-semibold text-gray-900">
              ₹{(discountPrice ?? originalPrice ?? "—")}
            </span>
            {discountPrice != null && originalPrice != null && discountPrice < originalPrice && (
              <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        {stock > 0 && (
          <div
            className={
              /* ADJUSTMENT: added '-translate-y-2 z-10' so on mobile the button lifts ~8px above card bottom.
                 Desktop behavior remains the same via md: classes. */
              "left-0 w-full flex justify-center transition-all duration-300 " +
              "opacity-100 mt-2 md:mt-0 -translate-y-2 z-10 " +
              "md:opacity-0 md:translate-y-4 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:absolute md:bottom-3"
            }
          >
            <button
              onClick={handleAddCart}
              className="relative w-[85%] py-2.5 bg-[#1C647C] hover:bg-[#004C4D] text-white font-semibold text-[15px] rounded-lg shadow-md overflow-hidden transition-all duration-300 flex items-center justify-center group/addbtn"
              aria-label={`Add ${product.name} to cart`}
            >
              {/* Text Layer */}
              <span className="transition-all duration-300 ease-out group-hover/addbtn:opacity-0 group-hover/addbtn:-translate-y-1">
                Add to Cart
              </span>

              {/* Icon Layer (Cart + Plus) */}
              <span className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover/addbtn:opacity-100 group-hover/addbtn:translate-y-0">
                <div className="relative w-5 h-5">
                  <ShoppingCart size={19} className="text-white" />
                  <Plus size={10} className="absolute -top-1 -right-1 text-green-400 bg-[#1C647C] rounded-full" />
                </div>
              </span>
            </button>
          </div>
        )}
      </Link>
    </div>
  );
}
