import React from "react";
import { Product } from "@/Types/types";
import { ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCategoriesMap } from "./useCategoriesMap";
import { BASE_URL } from "@/data";
import { useUserStore } from "@/store/userStore";
import StarIcons from "../ui/StarIcons";
import {
  MEDICOP_LIST_EVENT_NAME,
  getMedicopList,
  toggleMedicopItem,
} from "@/medicop/storage";

interface Props {
  product: Product;
  mode?: "default" | "medicop";
}

const PLACEHOLDER = "/placeholder.png";

const SEMA_BADGE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="36" viewBox="0 0 140 36" role="img" aria-label="SEMA Assured badge">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#06b6d4"/>
      <stop offset="1" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect rx="18" width="140" height="36" fill="url(#g)"></rect>
  <g transform="translate(8,6)">
    <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.14)"/>
    <path d="M6.2 10.5l2.3 2.3 5.3-5.8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="30" y="22" font-family="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="12" font-weight="700" fill="#ffffff">
    SEMA Assured
  </text>
</svg>
`;

const SEMA_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(SEMA_BADGE_SVG)}`;

export default function ProductCard({ product, mode = "default" }: Props) {
  const isMedicopMode = mode === "medicop";
  const { user } = useUserStore();
  const navigate = useNavigate();
  const variant = product.variants?.[0] ?? null;
  const productId = (product as any)._id;

  const originalPrice: number | null =
    variant?.originalPrice != null ? variant.originalPrice : null;
  const discountPrice: number | null =
    variant?.discountPrice != null ? variant.discountPrice : null;
  const stock: number = variant?.stock ?? 0;

  let discountPercent = 0;
  if (
    typeof originalPrice === "number" &&
    originalPrice > 0 &&
    typeof discountPrice === "number" &&
    discountPrice < originalPrice
  ) {
    discountPercent = Number((((originalPrice - discountPrice) / originalPrice) * 100).toFixed(2));
  }

  const imageUrl =
    (product as any).image ||
    (variant?.thumbnail && `${BASE_URL}images/${variant.thumbnail}`) ||
    PLACEHOLDER;

  const addToCart = useCartStore((s) => s.addToCart);
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore((s) => s);

  const inWishlist = wishlist.some(
    (w: any) => (w.product && (w.product as any)._id === productId) || w.productId === productId
  );

  const handleAddCart = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (!variant || (variant.stock ?? 0) <= 0) {
      toast.error("Out of stock", { position: "top-center", autoClose: 1500 });
      return;
    }

    const perPiecePrice = discountPrice ?? originalPrice ?? 0;

    const parsedMinMaxQty = JSON.parse(
      (product.minmaxrule as unknown as string) || '{"minQty":"1","maxQty":"1"}'
    ) as { minQty: string; maxQty: string };
    const intMinQty = parseInt(parsedMinMaxQty.minQty || "1");

    addToCart({
      productId,
      variantId: variant._id,
      product,
      variant,
      qty: intMinQty ?? 1,
      price: perPiecePrice,
      shopId: (product as any).shopId?._id || (product as any).shopId,
      taxClass: (product as any).taxClass ?? 0,
    });

    if (inWishlist) removeFromWishlist(productId, variant._id);

    toast.success(`${product.name} added to cart!`, {
      position: "top-center",
      autoClose: 2000,
      theme: "colored",
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (inWishlist) {
      removeFromWishlist(productId, variant?._id ?? null);
      toast.info("Removed from wishlist", { position: "top-center", autoClose: 1200 });
    } else {
      addToWishlist(product, variant ?? null);
      toast.success("Added to wishlist", { position: "top-center", autoClose: 1200 });
    }
  };

  const categoriesMap = useCategoriesMap();
  const getCategoryLabel = () => {
    const cat = (product as any).category;
    if (typeof cat === "string") return categoriesMap[cat] ?? cat ?? "General";
    if (Array.isArray(cat) && cat.length > 0) {
      const first = cat[0];
      if (typeof first === "string") return categoriesMap[first] ?? "General";
      if (first && typeof first === "object" && "name" in first) return (first as any).name ?? "General";
    }
    if (cat && typeof cat === "object" && "name" in cat) return (cat as any).name ?? "General";
    return "General";
  };

  const parseMinQty = (raw: any) => {
    if (!raw) return 1;
    if (typeof raw === "object" && raw.minQty) return Number(raw.minQty) || 1;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Number(parsed?.minQty) || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  };

  const moq = Number((product as any).moq) || parseMinQty((product as any).minmaxrule);
  const categoryLabel = getCategoryLabel();

  const [isTicked, setIsTicked] = React.useState(false);

  React.useEffect(() => {
    if (!isMedicopMode || !productId) return;
    const sync = () => setIsTicked(getMedicopList().some((x) => x.productId === productId));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(MEDICOP_LIST_EVENT_NAME, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(MEDICOP_LIST_EVENT_NAME, sync);
    };
  }, [isMedicopMode, productId]);

  return (
    <div className="group relative border rounded-xl bg-white hover:shadow-lg transition-all duration-300 overflow-hidden md:w-[220px] w-[62vw] max-w-[220px] md:h-[340px] h-44">
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 items-start pointer-events-none md:top-3 md:left-3">
        {!isMedicopMode && discountPercent >= 0 && (
          <div
            className="text-white text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#16a34a", boxShadow: "0 4px 10px rgba(2,6,23,0.08)" }}
          >
            {discountPercent}% OFF
          </div>
        )}

        {!isMedicopMode && (product as any).badge && (
          <img
            src={SEMA_BADGE}
            alt="SEMA Assured"
            className="w-[92px] h-6 object-contain rounded-full"
            style={{ filter: "drop-shadow(0 6px 10px rgba(2,6,23,0.08))" }}
          />
        )}
      </div>

      {!isMedicopMode && (
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
      )}

      <Link to={isMedicopMode ? `/medicop/product/${productId}` : `/product/${productId}`} className="block h-full">
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

        <div
          className={
            "w-full bg-white px-3 pb-3 pt-2 transition-all duration-300 transform " +
            "md:absolute md:bottom-[10px] md:left-0 md:w-full md:bg-white " +
            "md:translate-y-0 md:group-hover:-translate-y-10"
          }
        >
          <h3 className="text-sm font-medium text-gray-800 truncate">{product.name}</h3>
          <p className="text-xs text-gray-500 truncate capitalize hidden md:block">{categoryLabel}</p>

          {!isMedicopMode && (
            <div className="flex items-center gap-1 mt-1 md:flex" aria-hidden>
              <StarIcons stars={(product as any).avgRating ?? 0} reviewsCount={(product as any).reviewsCount || 0} />
            </div>
          )}

          {isMedicopMode ? (
            <p className="text-sm text-[#1C647C] font-semibold mt-1">MOQ: {moq}</p>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base md:text-lg font-semibold text-gray-900">
                Rs. {(discountPrice ?? originalPrice ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              {discountPrice != null && originalPrice != null && discountPrice < originalPrice && (
                <span className="text-sm text-gray-500 line-through hidden md:inline">
                  Rs. {originalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          )}
        </div>

        {!isMedicopMode && stock > 0 && (
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
              <span className="transition-all duration-300 ease-out group-hover/addbtn:opacity-0 group-hover/addbtn:-translate-y-1">
                Add to Cart
              </span>
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

      {isMedicopMode ? (
        <label
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-3 right-3 z-20 rounded-full bg-[#1C647C] shadow-lg flex items-center gap-2 pl-3 pr-2 h-9 text-white border-2 border-white/20 cursor-pointer"
          aria-label={`Select ${product.name}`}
          title={`Select ${product.name}`}
        >
          <span className="text-[11px] font-semibold whitespace-nowrap">Add to List</span>
          <input
            type="checkbox"
            checked={isTicked}
            onChange={(e) => {
              const next = e.target.checked;
              toggleMedicopItem(productId, next);
              setIsTicked(next);
            }}
            className="h-4 w-4 accent-white"
          />
        </label>
      ) : (
        stock > 0 && (
          <button
            onClick={handleAddCart}
            aria-label={`Add ${product.name} to cart`}
            title={`Add ${product.name} to cart`}
            className="md:hidden absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full bg-[#1C647C] shadow-lg flex items-center justify-center text-white border-2 border-white/20 hover:scale-105 transition-transform"
          >
            <ShoppingCart size={14} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center text-[#059669] text-[9px] font-semibold shadow-sm">
              +
            </span>
          </button>
        )
      )}
    </div>
  );
}
