import React from "react";
import { Link } from "react-router";
import { Product } from "../../Types/types";
import { IoMdCart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

export type ProductCardVariant = "default" | "square" | "tall" | "wide";

type ProductCardProps = {
  product: Product;
  variant?: ProductCardVariant;
};

export default function EquipmentProductCard({
  product,
  variant = "default",
}: ProductCardProps) {
  // calculate discount percent
  const productDiscount = Math.floor(
    ((product.originalPrice - product.discountPrice) /
      product.originalPrice) *
      100
  );

  // cart & wishlist hooks
  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore(
    (s) => s
  );
  const isInWishlist = wishlist.some((p) => p._id === product._id);

  // handlers
  function handleAddCart(e: React.MouseEvent) {
    e.preventDefault();
    addToCart({ product, qty: 1 });
  }
  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    isInWishlist
      ? removeFromWishlist(product._id)
      : addToWishlist(product);
  }

  // choose image
  const imageSrc = product.images?.[0]
    ? `/baseUrl/${product.images[0]}`
    : "/image60.png";

  // base classes
  const base = [
    "relative",
    "border",
    "rounded-xl",
    "bg-white",
    "shadow-sm",
    "transition hover:shadow-md",
    "p-3",
    "overflow-hidden",
  ];

  // variant classes
  const variantClassMap: Record<ProductCardVariant, string> = {
    default: "w-[220px] flex-col",
    // shrink square to 200x200
    square: "w-[200px] h-[200px] flex-col",
    tall: "w-[220px] h-[380px] flex-col",
    wide: "w-[480px] h-[220px] flex-row items-center",
  };

  const rootClass = [...base, "flex", variantClassMap[variant]].join(" ");

  // image container
  const imgClass = variant === "wide"
    ? "w-2/5 h-full flex items-center justify-center"
    : variant === "square"
    ? "w-full h-1/2 flex items-center justify-center mb-1"
    : variant === "tall"
    ? "w-full h-2/5 flex items-center justify-center mb-2"
    : "w-full h-44 flex items-center justify-center mb-2";

  // info container
  const infoClass = variant === "wide"
    ? "w-3/5 h-full flex flex-col justify-between pl-3"
    : "w-full flex flex-col justify-between flex-1";

  return (
    <article className={rootClass}>
      {/* discount badge */}
      {productDiscount > 0 && (
        <span className="absolute top-2 right-2 bg-red-100 text-red-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
          -{productDiscount}%
        </span>
      )}

      <Link
        to={`/product/${product._id}`}
        className={`flex ${variant === "wide" ? "flex-row" : "flex-col"} w-full h-full`}
      >
        {/* Image */}
        <div className={imgClass}>
          <img
            // src={imageSrc}
            src="/image60.png"
            alt={product.name}
            className="object-contain max-h-full max-w-full"
          />
        </div>

        {/* Info */}
        <div className={infoClass}>
          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 mb-1 break-words">
            {product.name}
          </h3>

          {/* Stars only default */}
          {variant === "default" && (
            <div className="flex gap-0.5 text-[#FF9529] text-sm mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>
                  {i < Math.round(product.ratings ?? 0) ? "★" : "☆"}
                </span>
              ))}
            </div>
          )}

          {/* Price & actions */}
          <div className="mt-1 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
              <span className="text-base font-semibold text-gray-900">
                ₹{product.discountPrice}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleWishlist}
                className="text-[16px] text-[#4F4F4F] hover:text-red-500"
              >
                {isInWishlist ? <FaHeart className="text-red-500" /> : <CiHeart />}
              </button>
              <button
                onClick={handleAddCart}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-[#005B5D] text-white hover:bg-[#004C4D]"
              >
                <IoMdCart className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
