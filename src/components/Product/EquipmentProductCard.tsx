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
  const discountPct = Math.floor(
    ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
  );

  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s);
  const inWishlist = wishlist.some((p) => p._id === product._id);

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ product, qty: 1 });
  };
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  const imageSrc = product.images?.[0]
    ? `/baseUrl/${product.images[0]}`
    : "/image60.png";

  const base = [
    "relative",
    "border",
    "rounded-xl",
    "bg-white",
    "shadow-sm",
    "transition hover:shadow-md",
    "overflow-hidden",
    "flex",
    "p-3",
  ];
  const sizeMap: Record<ProductCardVariant, string> = {
    default: "w-[245px] flex-col",
    square: "w-[240px] h-[210px] flex-col",
    tall: "w-[230px] h-[430px] flex-col",
    wide: "w-[510px] h-[210px] flex-row",
  };
  const rootClass = [...base, sizeMap[variant]].join(" ");

  // === SQUARE VARIANT ===
 if (variant === "square") {
  return (
    <article className={rootClass}>
      {discountPct > 0 && (
        <span className="absolute top-2 right-2 bg-red-100 text-red-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
          -{discountPct}%
        </span>
      )}

      <Link to={`/product/${product._id}`} className="flex flex-col w-full h-full">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 max-w-[180px]">
          {/* {product.name} */}
          Women's pleated short sleeve scrubs
        </h3>

        {/* Image */}
        <div className="w-full h-[100px] rounded-md bg-center bg-cover mb-2"
         //style={{ backgroundImage: `url(${imageSrc})`
         style={{ backgroundImage: `url(${"squared.png"})`
          }} />

        {/* Price + Icons */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
            <span className="text-base font-semibold text-gray-900">
              ₹{product.discountPrice}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWishlist}
              className="text-[16px] text-[#4F4F4F] hover:text-red-500"
            >
              {inWishlist ? <FaHeart className="text-red-500" /> : <CiHeart />}
            </button>
            <button
              onClick={handleAddCart}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-[#005B5D] text-white hover:bg-[#004C4D]"
            >
              <IoMdCart className="text-sm" />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}


  // === WIDE VARIANT ===
  if (variant === "wide") {
    return (
      <article className={rootClass}>
        {discountPct > 0 && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}

        <Link to={`/product/${product._id}`} className="relative w-full h-full">
          <h3 className="absolute top-3 left-3 text-sm font-medium text-gray-900 bg-white px-1 z-10 max-w-[180px]">
            {/* {product.name} */}
            Women's pleated short sleeve scrubs
          </h3>

          <div className="flex w-full h-full">
            <div className="w-1/3 relative p-3">
              <div className="absolute bottom-3 left-3 flex flex-col">
                <span className="text-xs text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
                <span className="text-base font-semibold text-gray-900">
                  ₹{product.discountPrice}
                </span>
              </div>
            </div>
            <div
              className="w-full h-full relative bg-center bg-cover"
              //style={{ backgroundImage: `url(${imageSrc})` }}
              style={{ backgroundImage: `url("fan.png")` }}
            >
              <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                <button
                  onClick={handleToggleWishlist}
                  className="text-[16px] text-[#4F4F4F] hover:text-red-500"
                >
                  {inWishlist ? <FaHeart className="text-red-500" /> : <CiHeart />}
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

  // === DEFAULT / TALL ===
  const imgClass =
    variant === "tall"
      ? "w-full h-3/5 flex items-center justify-center mt-4 mb-2"
      : "w-full h-44 flex items-center justify-center mb-2";

  const infoClass =
    variant === "tall"
      ? "w-full flex flex-col justify-between flex-1 pt-4"
      : "w-full flex flex-col justify-between flex-1";

  return (
    <article className={rootClass}>
      {discountPct > 0 && (
        <span className="absolute top-2 right-2 bg-red-100 text-red-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
          -{discountPct}%
        </span>
      )}

      <Link to={`/product/${product._id}`} className="flex flex-col gap-2 w-full h-full">
        <div className={imgClass}>
          <img
            //src={imageSrc}
            src="image60.png"
            alt={product.name}
            className="object-contain max-h-full max-w-full"
          />
        </div>

        <div className={infoClass}>
          <h3 className="text-sm font-medium text-gray-900 mb-1 break-words max-w-[180px]">
            {/* {product.name} */}
            Women's pleated short sleeve scrubs
          </h3>

          {variant === "default" && (
            <div className="flex gap-0.5 text-[#FF9529] text-sm mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>
                  {i < Math.round(product.ratings ?? 0) ? "★" : "☆"}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
              <span className="text-base font-semibold text-gray-900">
                ₹{product.discountPrice}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleWishlist}
                className="text-[16px] text-[#4F4F4F] hover:text-red-500"
              >
                {inWishlist ? <FaHeart className="text-red-500" /> : <CiHeart />}
              </button>
              <button
                onClick={handleAddCart}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-[#005B5D] text-white hover:bg-[#004C4D]"
              >
                <IoMdCart className="text-sm"/>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
