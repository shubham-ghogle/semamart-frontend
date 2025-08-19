import React from "react";
import { Link } from "react-router";
import { Product } from "../../Types/types";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

// Replace this with your uploaded image filenames in the next message!
const uploadedImages = [
  "/MedicalImages/imagea.png",
  "/MedicalImages/imageb.png",
  "/MedicalImages/imagec.png",
    "/MedicalImages/imaged.jpg",
        "/MedicalImages/imaged.png",

  "/MedicalImages/imagef.png",
    "/MedicalImages/imageg.png",
  "/MedicalImages/imageh.png",
  "/MedicalImages/imagej.png",
    "/MedicalImages/imagek.png",
  "/MedicalImages/imagel.png",
  
  
];

export type ProductCardVariant = "default" | "square" | "tall" | "wide";

type ProductCardProps = {
  product: Product;
  variant?: ProductCardVariant;
};

export default function EquipmentProductCard({
  product,
  // variant = "default",
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

  // // Pick image from uploadedImages array for demo (use product index if available)
  // const imageSrc =
  //   product.images?.[0] ||
  //   uploadedImages[Math.floor(Math.random() * uploadedImages.length)];
  
  const imageSrc = uploadedImages[Math.floor(Math.random() * uploadedImages.length)];

  return (
    <article
      className="relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 flex flex-col border border-gray-200 p-4"
      style={{ width: 240, minHeight: 370 }}
    >
      {discountPct > 0 && (
        <span className="absolute top-2 right-2 font-montserrat border-[#DF848E] border-2 text-[#DF848E] text-xs px-2 py-0.5 rounded-md bg-white">
          -{discountPct}%
        </span>
      )}

      <Link to={`/product/${product._id}`} className="flex flex-col w-full h-full group">
        <div className="w-full h-48 flex items-center justify-center mb-3 bg-gray-50 rounded-lg overflow-hidden">
          <img
            src={imageSrc}
            alt={product.name}
            className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        <h3 className="text-base font-semibold text-[#1C170D] mb-1 line-clamp-2 font-montserrat">
          {product.name}
        </h3>

        <div className="flex gap-1 text-[#FF9529] text-sm mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>{i < Math.round(product.ratings ?? 0) ? "★" : "☆"}</span>
          ))}
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 line-through font-montserrat">
              ₹{product.originalPrice}
            </span>
            <span className="font-bold text-lg font-montserrat text-[#2F3B54]">
              ₹{product.discountPrice}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWishlist}
              className="hover:scale-110 transition-transform"
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-xs border border-gray-200">
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
            <button
              onClick={handleAddCart}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1C647C] hover:bg-[#004C4D] text-white font-bold text-lg"
              title="Add to Cart"
            >
              <img src="/st_icon.png" alt="Cart" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}