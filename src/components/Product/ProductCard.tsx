import React from "react";
import { Link } from "react-router";
import { Product, Variant } from "../../Types/types";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { BASE_URL } from "@/data";

type DefaultProductCardProps = {
  product: Product;
};

function getId(obj: any): string | undefined {
  // Works when obj is either { _id: string } OR a string id OR undefined
  if (!obj) return undefined;
  if (typeof obj === "string") return obj;
  return obj._id ?? undefined;
}

export default function DefaultProductCard({
  product,
}: DefaultProductCardProps) {
  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore(
    (s) => s,
  );

  // first variant fallback
  const firstVariant: Variant = product.variants?.[0];

  // guard: if there's no variant, we cannot be in wishlist for this variant
  const variantId = getId(firstVariant);
  const productId = getId(product);

  // wishlist check safely (handles wishlist entries shaped as {product: {...}, variant: {...}}
  // or { productId: "...", variantId: "..." } if your store uses that shape).
  const inWishlist = Boolean(
    variantId &&
    wishlist?.some((w: any) => {
      const wp = getId(w?.product ?? w?.productId ?? w?.product_id);
      const wv = getId(w?.variant ?? w?.variantId ?? w?.variant_id);
      return wp === productId && wv === variantId;
    }),
  );

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstVariant) return;

    addToCart({
      productId: product._id,
      variantId: firstVariant._id,
      product,
      variant: firstVariant,
      qty: 1,
      price: firstVariant.discountPrice ?? firstVariant.originalPrice ?? 0,
      shopId: (product as any).shopId?._id || (product as any).shopId,
    });

    if (inWishlist) removeFromWishlist(product._id, firstVariant._id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstVariant) return;
    if (inWishlist) {
      removeFromWishlist(product._id, firstVariant._id);
    } else {
      addToWishlist(product, firstVariant);
    }
  };

  const imageSrc =firstVariant.thumbnail
    ? `${BASE_URL}images/${firstVariant.thumbnail}`
    : "/image60.png";

  const discountPct =
    firstVariant && firstVariant.discountPrice
      ? Math.floor(
          ((firstVariant.originalPrice - firstVariant.discountPrice) /
            firstVariant.originalPrice) *
            100,
        )
      : 0;

  return (
    <article className="relative border rounded-xl bg-white shadow-xs transition hover:shadow-md overflow-hidden flex p-3 w-[215px] h-[360px] flex-col">
      {discountPct > 0 && (
        <span className="absolute top-2 right-2 font-montserrat border-[#DF848E] border-2 text-[#DF848E] text-[10px] px-2 py-0.5 rounded-md">
          -{discountPct}%
        </span>
      )}

      <Link
        to={`/product/${product._id}`}
        className="flex flex-col gap-2 w-full h-full"
      >
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
              {firstVariant?.discountPrice ? (
                <>
                  <span className="text-xs text-gray-400 line-through font-montserrat">
                    ₹{firstVariant.originalPrice}
                  </span>
                  <span className="font-normal text-lg font-montserrat text-[#2F3B54]">
                    ₹{firstVariant.discountPrice}
                  </span>
                </>
              ) : (
                <span className="font-normal text-lg font-montserrat text-[#2F3B54]">
                  ₹{firstVariant?.originalPrice ?? "N/A"}
                </span>
              )}
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
