import React from "react";
import { Link } from "react-router";

import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import chair from "../../../public/light.png"; 
import heart from "../../../public/heart.svg";
import cart from "../../../public/cart.png";

type Product = {
  _id: string;
  name: string;
  originalPrice: number;
  discountPrice: number;
  ratings: number;
  images: string[];
};

type DefaultProductCardProps = {
  product: Product;
};

export default function RelatedProductCard({ product }: DefaultProductCardProps) {
  const discountPct = Math.floor(
    ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
  );

  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s);
  const inWishlist = wishlist.some((p) => p._id === product._id);

  const imageSrc = chair; // use the imported chair image

  return (
   <article className="relative border-b border-l border-r rounded-xl bg-white shadow-sm transition hover:shadow-md overflow-hidden flex p-3 w-[215px] h-[350px] flex-col">
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
  <button
  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300"
>
  <img src={heart} alt="Wishlist" className="w-3.5 h-3.5" />
</button>


  <button
    className="w-6 h-6 flex items-center justify-center rounded-full bg-[#1C647C] "
  >
    <img src={cart} alt="Cart" className="w-3.5 h-3.5" />
  </button>
</div>


          </div>
        </div>
      </Link>
    </article>
  );
}
