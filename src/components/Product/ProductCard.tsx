import React from "react";
import { Link } from "react-router";
import { Product } from "../../Types/types";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

type DefaultProductCardProps = {
  product: Product;
};

export default function DefaultProductCard({ product }: DefaultProductCardProps) {
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

  return (
    <article className="relative border rounded-xl bg-white shadow-sm transition hover:shadow-md overflow-hidden flex p-3 w-[215px] h-[350px] flex-col">
      {discountPct > 0 && (
        <span className="absolute top-2 right-2 font-montserrat border-[#DF848E] border-2 text-[#DF848E] text-[10px] px-2 py-0.5 rounded-md">
          -{discountPct}%
        </span>
      )}

      <Link to={`/product/${product._id}`} className="flex flex-col gap-2 w-full h-full">
        <div className="w-full h-44 flex items-center justify-center mb-2">
          <img
            src={imageSrc}
            alt={product.name}
            className="object-contain max-h-full max-w-full"
          />
        </div>

        <div className="w-full flex flex-col justify-between flex-1">
          <h3 className="text-xs font-medium text-[#1C170D] mb-1 break-words max-w-[180px] font-montserrat">
            {product.name}
          </h3>

          <div className="flex gap-0.5 text-[#FF9529] text-sm mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>
                {i < Math.round(product.ratings ?? 0) ? "★" : "☆"}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 line-through font-montserrat">
                ₹{product.originalPrice}
              </span>
              <span className="font-normal text-lg font-montserrat text-[#2F3B54]">
                ₹{product.discountPrice}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleToggleWishlist}>
                <img
                  src="/heart_icon.png"
                  alt="Wishlist"
                  className="w-4 h-4"
                  style={{
                    filter: inWishlist
                      ? "invert(21%) sepia(99%) saturate(7487%) hue-rotate(356deg) brightness(90%) contrast(105%)"
                      : undefined,
                  }}
                />
              </button>
              <button
                onClick={handleAddCart}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-[#1C647C] hover:bg-[#004C4D]"
              >
                <img src="/st_icon.png" alt="Cart" className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
