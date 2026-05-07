import React, { useState } from "react";
import { Product } from "@/Types/types";
import { ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCategoriesMap } from "./useCategoriesMap";
import { BASE_URL } from "@/data";
import { useUserStore } from "@/store/userStore";

interface Props {
  product: Product;
}

const PLACEHOLDER = "/placeholder.png";

export default function ProductCardMediqop({ product }: Props) {
  const [checked, setChecked] = useState(false);

  const { user } = useUserStore();
  const n = useNavigate();

  const variant =
    (product as any).defaultVariant ||
    product.variants?.[0] ||
    null;

  const isAvailableToOrder =
    (product as any)?.isAvailableToOrder ??
    ((product as any)?.visibilityByAdmin === true &&
      (product as any)?.visibilityBySeller === true);

  // image selection
  const imageUrl = variant?.thumbnail
    ? variant.thumbnail.startsWith("http")
      ? variant.thumbnail
      : `${BASE_URL}images/${variant.thumbnail}`
    : PLACEHOLDER;

  // cart store
  const addToCart = useCartStore((s) => s.addToCart);

  const handleAddCart = (
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!checked) {
      toast.warning("Please select the product first", {
        position: "top-center",
        autoClose: 1500,
      });
      return;
    }

    if (!user) {
      n("/login");
      return;
    }

    if (!variant) {
      toast.error("Variant not found", {
        position: "top-center",
        autoClose: 1500,
      });
      return;
    }

    if ((variant.stock ?? 0) <= 0) {
      toast.error("Out of stock", {
        position: "top-center",
        autoClose: 1500,
      });
      return;
    }

    if (!isAvailableToOrder) {
      toast.error("This product is currently inactive", {
        position: "top-center",
        autoClose: 1500,
      });
      return;
    }

    const discountPrice = Number(
      variant.discountPrice ?? 0
    );

    const originalPrice = Number(
      variant.originalPrice ?? 0
    );

    const perPiecePrice =
      discountPrice > 0
        ? discountPrice
        : originalPrice;

    let intMinQty = 1;

    try {
      const parsedMinMaxQty =
        typeof product.minmaxrule === "string"
          ? JSON.parse(product.minmaxrule)
          : product.minmaxrule || {};

      const parsedValue = parseInt(
        parsedMinMaxQty?.minQty || "1",
        10
      );

      intMinQty = isNaN(parsedValue)
        ? 1
        : parsedValue;
    } catch {
      intMinQty = 1;
    }

    const shopId =
      typeof (product as any).shopId === "string"
        ? (product as any).shopId
        : ((product as any).shopId?._id ?? "");

    addToCart({
      productId: product._id,
      variantId: variant._id,
      product,
      variant,
      qty: intMinQty,
      price: perPiecePrice,
      shopId,
      taxClass: Number((product as any).taxClass ?? 0),
    });

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

  // --- resolve category name using categoriesMap fetched from backend ---
  const categoriesMap = useCategoriesMap();

  const getCategoryLabel = (): string => {
    const cat = product.category;

    // populated array
    if (Array.isArray(cat) && cat.length > 0) {
      const first = cat[0];

      if (
        first &&
        typeof first === "object" &&
        "name" in first
      ) {
        return (first as any).name ?? "General";
      }

      if (typeof first === "string") {
        return categoriesMap[first] ?? "General";
      }
    }

    // single string
    if (typeof cat === "string") {
      return categoriesMap[cat] ?? "General";
    }

    // single object
    if (
      cat &&
      typeof cat === "object" &&
      "name" in cat
    ) {
      return (cat as any).name ?? "General";
    }

    return "General";
  };

  const categoryLabel = getCategoryLabel();

  const stock = Number(variant?.stock ?? 0);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setChecked((prev) => !prev);
  };

  return (
    <div
      className="
        group relative border rounded-xl bg-white hover:shadow-lg
        transition-all duration-300 overflow-hidden
        md:w-[220px] w-[62vw] max-w-[220px]
        md:h-[340px] h-auto
      "
    >
      {/* Checkbox */}
      <div className="absolute top-3 right-3 z-30">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
          className="w-5 h-5 text-[#1C647C] rounded border-gray-300 focus:ring-[#1C647C]"
          aria-label={`Select ${product.name}`}
        />
      </div>

      {/* Whole card clickable */}
      <Link
        to={`/product/${product._id}`}
        className="block h-full"
      >
        {/* Image */}
        <div className="flex items-center justify-center bg-gray-50 overflow-hidden md:h-[190px] h-24 p-2">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-[84%] max-w-[84%] object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (
                e.currentTarget as HTMLImageElement
              ).src = PLACEHOLDER;
            }}
          />
        </div>

        {/* Text */}
        <div
          className={
            "w-full bg-white px-3 pb-3 pt-2 transition-all duration-300 transform " +
            "md:absolute md:bottom-[10px] md:left-0 md:w-full md:bg-white " +
            "md:translate-y-0 md:group-hover:-translate-y-10"
          }
        >
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-xs text-gray-500 truncate capitalize hidden md:block">
            {categoryLabel}
          </p>
        </div>

        {/* Desktop Add to Cart */}
        {isAvailableToOrder && stock > 0 && (
          <div
            className={
              "hidden md:flex left-0 w-full justify-center transition-all duration-300 " +
              "opacity-0 md:mt-0 md:translate-y-4 md:group-hover:translate-y-0 " +
              "md:group-hover:opacity-100 md:absolute md:bottom-3"
            }
          >
            <button
              onClick={handleAddCart}
              className="relative w-[85%] py-2.5 bg-[#1C647C] hover:bg-[#004C4D] text-white font-semibold text-[15px] rounded-lg shadow-md overflow-hidden transition-all duration-300 flex items-center justify-center group/addbtn"
              aria-label={`Add ${product.name} to cart`}
              disabled={!checked}
            >
              {/* Text */}
              <span className="transition-all duration-300 ease-out group-hover/addbtn:opacity-0 group-hover/addbtn:-translate-y-1">
                Add to Cart
              </span>

              {/* Icon */}
              <span className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover/addbtn:opacity-100 group-hover/addbtn:translate-y-0">
                <div className="relative w-5 h-5">
                  <ShoppingCart
                    size={19}
                    className="text-white"
                  />

                  <Plus
                    size={10}
                    className="absolute -top-1 -right-1 text-green-400 bg-[#1C647C] rounded-full"
                  />
                </div>
              </span>
            </button>
          </div>
        )}
      </Link>

      {/* Mobile Add to Cart */}
      {isAvailableToOrder && stock > 0 && (
        <button
          onClick={handleAddCart}
          aria-label={`Add ${product.name} to cart`}
          title={`Add ${product.name} to cart`}
          className="md:hidden absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full bg-[#1C647C] shadow-lg flex items-center justify-center text-white border-2 border-white/20 hover:scale-105 transition-transform"
          disabled={!checked}
        >
          <ShoppingCart size={14} />

          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center text-[#059669] text-[9px] font-semibold shadow-sm">
            +
          </span>
        </button>
      )}
    </div>
  );
}