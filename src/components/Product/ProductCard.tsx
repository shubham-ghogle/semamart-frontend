import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product, Variant } from "../../Types/types";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { BASE_URL } from "@/data";
import { useUserStore } from "@/store/userStore";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StarIcons from "../ui/StarIcons";


type DefaultProductCardProps = {
  product: Product;
};

function getId(obj: any): string | undefined {
  if (!obj) return undefined;
  if (typeof obj === "string") return obj;
  return obj._id ?? undefined;
}

export default function DefaultProductCard({ product }: DefaultProductCardProps) {
  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s);

  const firstVariant: Variant | undefined = product.variants?.[0];

  const variantId = getId(firstVariant);
  const productId = getId(product);

  const inWishlist = Boolean(
    variantId &&
      wishlist?.some((w: any) => {
        const wp = getId(w?.product ?? w?.productId ?? w?.product_id);
        const wv = getId(w?.variant ?? w?.variantId ?? w?.variant_id);
        return wp === productId && wv === variantId;
      })
  );

  const { user } = useUserStore();
  const navigate = useNavigate();

  const safeParseMinQty = (): number => {
    try {
      const parsed = JSON.parse(product.minmaxrule as unknown as string) as { minQty?: string; maxQty?: string };
      return parseInt(parsed?.minQty || "1", 10) || 1;
    } catch {
      return 1;
    }
  };

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // prevent Link navigation
    if (!firstVariant || !product) return;

    if (!user) {
      toast.info("Please log in to add items to cart", { position: "top-center", autoClose: 1400 });
      navigate("/login");
      return;
    }

    // check stock if present
    if ((firstVariant.stock ?? 0) <= 0) {
      toast.error("Out of stock", { position: "top-center", autoClose: 1400 });
      return;
    }

    const intMinQty = safeParseMinQty();

    addToCart({
      productId: product._id,
      variantId: firstVariant._id,
      product,
      variant: firstVariant,
      qty: intMinQty,
      price: firstVariant.discountPrice ?? firstVariant.originalPrice ?? 0,
      shopId: (product as any).shopId?._id || (product as any).shopId,
    });

    toast.success(`${product.name} added to cart`, { position: "top-center", autoClose: 1400 });

    if (inWishlist) {
      removeFromWishlist(product._id, firstVariant._id);
      toast.info("Removed from wishlist", { position: "top-center", autoClose: 1200 });
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info("Please log in to manage wishlist", { position: "top-center", autoClose: 1400 });
      navigate("/login");
      return;
    }
    if (!firstVariant) return;
    if (inWishlist) {
      removeFromWishlist(product._id, firstVariant._id);
      toast.info("Removed from wishlist", { position: "top-center", autoClose: 1200 });
    } else {
      addToWishlist(product, firstVariant);
      toast.success("Added to wishlist", { position: "top-center", autoClose: 1200 });
    }
  };

  const imageSrc = firstVariant?.thumbnail ? `${BASE_URL}images/${firstVariant.thumbnail}` : "/image60.png";

  const discountPct =
    firstVariant && firstVariant.discountPrice
      ? Math.floor(((firstVariant.originalPrice - firstVariant.discountPrice) / Math.max(firstVariant.originalPrice, 1)) * 100)
      : 0;

  return (
    <article className="relative border rounded-xl bg-white shadow-xs transition hover:shadow-md overflow-hidden flex flex-col">
      {/* discount badge */}
      {discountPct > 0 && (
        <span className="absolute top-3 right-3 z-10 text-xs px-2 py-0.5 rounded-md bg-white/90 border text-red-600">
          -{discountPct}%
        </span>
      )}

      {/* whole card is a link; buttons inside prevent navigation */}
      <Link to={`/product/${product._id}`} className="flex flex-col gap-2 w-full h-full">
        {/* image area fixed height to keep uniform card heights */}
        <div className="w-full p-3 bg-white flex items-center justify-center">
          <div className="w-full max-w-[260px] h-36 md:h-44 flex items-center justify-center">
            <img src={imageSrc} alt={product.name} className="max-h-full max-w-full object-contain" />
          </div>
        </div>

        {/* content */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="text-sm font-medium text-[#1C170D] mb-2 line-clamp-2" title={product.name}>
            {product.name}
          </h3>

          <div className="flex items-center gap-2 text-[#FF9529] text-sm mb-2">
           <StarIcons
            stars={product.avgRating ?? 0}
            reviews={product.avgRating ?? 0}
          />
             
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              {firstVariant?.discountPrice ? (
                <>
                  <span className="text-xs text-gray-400 line-through">
                    ₹{firstVariant.originalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="font-medium text-lg text-[#2F3B54]">
                    ₹{firstVariant.discountPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </>
              ) : (
                <span className="font-medium text-lg text-[#2F3B54]">
                  {firstVariant?.originalPrice != null ? (
                    <>₹{firstVariant.originalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</>
                  ) : (
                    "N/A"
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={inWishlist}
                className="p-2 rounded-full bg-white shadow-sm border border-gray-200 hover:scale-105 transition-transform"
              >
                {/* lucide heart */}
                <Heart size={16} className={inWishlist ? "text-[#DF848E]" : "text-[#1C647C]"} />
              </button>

              <button
                onClick={handleAddCart}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1C647C] hover:bg-[#0f4f51] text-white"
                aria-label="Add to cart"
                type="button"
              >
                {/* lucide shopping cart */}
                <ShoppingCart size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
