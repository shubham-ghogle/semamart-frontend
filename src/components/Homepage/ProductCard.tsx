import React from "react";
import { Product } from "@/Types/types";
import {  ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCategoriesMap } from "./useCategoriesMap";
import { BASE_URL } from "@/data";
import { useUserStore } from "@/store/userStore";
import StarIcons from "../ui/StarIcons";

interface Props {
  product: Product;
}

const PLACEHOLDER = "/placeholder.png";

// SEMA Assured badge (SVG embedded as data URL)
const SEMA_BADGE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="36" viewBox="0 0 140 36" role="img" aria-label="SEMA Assured badge">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#06b6d4"/>
      <stop offset="1" stop-color="#059669"/>
    </linearGradient>
  </defs>

  <rect rx="18" width="140" height="36" fill="url(#g)"></rect>

  <!-- left circle with check -->
  <g transform="translate(8,6)">
    <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.14)"/>
    <path d="M6.2 10.5l2.3 2.3 5.3-5.8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- label -->
  <text x="30" y="22" font-family="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="12" font-weight="700" fill="#ffffff">
    SEMA Assured
  </text>
</svg>
`;

const SEMA_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(SEMA_BADGE_SVG)}`;

export default function ProductCard({ product }: Props) {
  const { user } = useUserStore();
  const n = useNavigate();
  const variant = product.variants?.[0] ?? null;

  // prices (use nullish to allow 0)
  const originalPrice: number | null =
    variant?.originalPrice != null ? variant.originalPrice : null;
  const discountPrice: number | null =
    variant?.discountPrice != null ? variant.discountPrice : null;
  const stock: number = variant?.stock ?? 0;

  // discount percent
  let discountPercent: number = 0;
  if (
    typeof originalPrice === "number" &&
    originalPrice > 0 &&
    typeof discountPrice === "number" &&
    discountPrice < originalPrice
  ) {
    const rawPercent = ((originalPrice - discountPrice) / originalPrice) * 100;
    discountPercent = Number(rawPercent.toFixed(2));
  }

  // image selection
  const imageUrl = (variant?.thumbnail && `${BASE_URL}images/${variant.thumbnail}`) || PLACEHOLDER;

  // wishlist + cart stores
  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s);

  const inWishlist = wishlist.some(
    (w: any) => (w.product && (w.product as any)._id === product._id) || w.productId === product._id
  );

  const handleAddCart = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // allow calling without event (e.g. programmatically)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user) {
      n("/login");
      return;
    }

    if (!variant || (variant.stock ?? 0) <= 0) {
      toast.error("Out of stock", { position: "top-center", autoClose: 1500 });
      return;
    }

    if (!product) return;

    const perPiecePrice = discountPrice ?? originalPrice ?? 0;

    const parsedMinMaxQty = JSON.parse(
      (product.minmaxrule as unknown as string) || '{"minQty":"1","maxQty":"1"}',
    ) as { minQty: string; maxQty: string };
    const intMinQty = parseInt(parsedMinMaxQty.minQty || "1");

    addToCart({
      productId: product._id,
      variantId: variant._id,
      product,
      variant,
      qty: intMinQty ?? 1,
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

    if (!user) {
      n("/login");
      return;
    }

    if (inWishlist) {
      removeFromWishlist(product._id, variant?._id ?? null);
      toast.info("Removed from wishlist", {
        position: "top-center",
        autoClose: 1200,
      });
    } else {
      addToWishlist(product, variant ?? null);
      toast.success("Added to wishlist", {
        position: "top-center",
        autoClose: 1200,
      });
    }
  };

  // ratings (0..5)
  // const ratingRaw = typeof product.ratings === "number" ? product.ratings : 0;
  // const rating = Math.min(Math.max(Math.round(ratingRaw), 0), 5);

  // --- resolve category name using categoriesMap fetched from backend ---
  const categoriesMap = useCategoriesMap();

  const getCategoryLabel = (): string => {
    const cat = product.category;

    // Case: populated array of objects [{ _id, name }]
    if (Array.isArray(cat) && cat.length > 0) {
      const first = cat[0];
      if (first && typeof first === "object" && "name" in first) {
        return (first as any).name ?? "General";
      }
      // if first is string (id)
      if (typeof first === "string") {
        return categoriesMap[first] ?? "General";
      }
    }

    // Case: single string id
    if (typeof cat === "string") {
      return categoriesMap[cat] ?? "General";
    }

    // Case: single populated object { name }
    if (cat && typeof cat === "object" && "name" in cat) {
      return (cat as any).name ?? "General";
    }

    return "General";
  };

  const categoryLabel = getCategoryLabel();

  return (
    <div
      className="
        group relative border rounded-xl bg-white hover:shadow-lg transition-all duration-300 overflow-hidden
        md:w-[220px] w-[62vw] max-w-[220px] md:h-[340px] h-44
      ">
      {/* Compact stacked badges: discount + SEMA */}
      <div
        className="
          absolute top-3 left-3 z-20 flex flex-col gap-1 items-start
          pointer-events-none
          md:top-3 md:left-3
        "
      >
        {/* Discount badge (kept clickable-disabled via pointer-events-none from parent; it's just visual) */}
        {discountPercent >= 0 && (
          <div
            className="text-white text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "#16a34a",
              boxShadow: "0 4px 10px rgba(2,6,23,0.08)",
            }}
          >
            {discountPercent}% OFF
          </div>
        )}

        {/* SEMA Assured badge - smaller, aligned under discount */}
       {/* SEMA Assured badge - show only if badge is true */}
{product.badge && (
  <img
    src={SEMA_BADGE}
    alt="SEMA Assured"
    className="w-[92px] h-6 object-contain rounded-full"
    style={{
      filter: "drop-shadow(0 6px 10px rgba(2,6,23,0.08))",
    }}
  />
)}

      </div>

      {/* Wishlist Button (kept top-right, pointer-events enabled) */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 hover:scale-105 transition-transform"
        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        aria-pressed={inWishlist}
      >
        <span
          className="w-3.5 h-3.5 inline-block transition duration-200"
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
        <div className="flex items-center justify-center bg-gray-50 overflow-hidden md:h-[190px] h-24 p-2">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-[84%] max-w-[84%] object-contain transition-transform duration-300 group-hover:scale-105"
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

          {/* hide category & rating on mobile to reduce clutter */}
          <p className="text-xs text-gray-500 truncate capitalize hidden md:block">{categoryLabel}</p>

          <div className="flex items-center gap-1 mt-1 md:flex" aria-hidden>
            <StarIcons
            stars={product.avgRating ?? 0}
            reviewsCount={product.reviewsCount || 0}
            
          />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-base md:text-lg font-semibold text-gray-900">
              ₹{(
                discountPrice ?? originalPrice ?? 0
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
           
            {/* hide crossed original price on mobile */}
            {discountPrice != null && originalPrice != null && discountPrice < originalPrice && (
              <span className="text-sm text-gray-500 line-through hidden md:inline">₹{originalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            )}
          </div>
        </div>

        {/* Desktop: Add to Cart Button (kept for md+, hidden on mobile) */}
        {stock > 0 && (
          <div
            className={
              "hidden md:flex left-0 w-full justify-center transition-all duration-300 " +
              "opacity-0 md:mt-0 md:translate-y-4 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:absolute md:bottom-3"
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

      {/* Mobile: small circular Add-to-cart icon at bottom-right (visible only on mobile) */}
      {stock > 0 && (
        <button
          onClick={handleAddCart}
          aria-label={`Add ${product.name} to cart`}
          title={`Add ${product.name} to cart`}
          className="md:hidden absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full bg-[#1C647C] shadow-lg flex items-center justify-center text-white border-2 border-white/20 hover:scale-105 transition-transform"
        >
          {/* slightly smaller centered cart icon */}
          <ShoppingCart size={14} />

          {/* smaller white badge with green '+' */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center text-[#059669] text-[9px] font-semibold shadow-sm">
            +
          </span>
        </button>
      )}
    </div>
  );
}