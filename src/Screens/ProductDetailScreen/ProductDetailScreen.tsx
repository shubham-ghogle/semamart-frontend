// src/Screens/ProductDetailScreen/ProductDetailsScreen.tsx
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import ProductMedia from "../../components/Product/ProductMedia";
import RatingsStarView from "../../components/UIComponents/RatingStarView";
import ProductPrice from "../../components/Product/ProductPrice";
import { useState } from "react";
import { useCartStore } from "../../store/cartStore";
import ProductPageBtns from "../../components/Product/ProductPageBtns";
import { useWishlistStore } from "../../store/wishlistStore";
import ProductDetailsInfo from "../../components/Product/ProductDetailsInfo";
import { getProductDetail } from "./ProductDetails.HooksUtils";

/**
 * Product details screen
 *
 * - Shows product name and brand (brand displayed below name)
 * - Keeps all existing logic for cart / wishlist / pricing
 */

export default function ProductDetailsScreen() {
  const { id } = useParams();
  const { data: product, status } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id as string),
    // optional: keep previous data etc.
  });

  const [count, setCount] = useState(1);
  const { addToCart, cart } = useCartStore((state) => state);

  function addToCartHandler() {
    if (!product) return;

    // pick variant (defaultVariant fallback to first)
    const variant = (product as any).defaultVariant || product.variants?.[0];
    if (!variant) {
      alert("No variant available for this product");
      return;
    }

    // check if already in cart (by product + variant)
    const isItemInCart = cart.some((el) => {
      const elProdId =
        typeof el.productId === "string" ? el.productId : (el.productId as any)?._id;
      const elVarId =
        typeof el.variantId === "string" ? el.variantId : (el.variantId as any)?._id;
      return elProdId === product._id && elVarId === variant._id;
    });
    if (isItemInCart) {
      alert("Item already in the cart");
      return;
    }

    // per-piece price calculation
    let perPiece = 0;
    if (Array.isArray(variant.bulkOrders) && variant.bulkOrders.length > 0) {
      const firstPack = variant.bulkOrders[0];
      perPiece = firstPack.price / Math.max(firstPack.qty, 1);
    } else {
      perPiece = variant.discountPrice ?? variant.originalPrice ?? 0;
    }

    const item = {
      productId: product._id,
      variantId: variant._id,
      product,
      variant,
      qty: count,
      price: perPiece,
      shopId: (product.shopId as any)?._id || (product.shopId as string),
      taxClass: (product as any).taxClass ?? 0,
    };

    addToCart(item);
  }

  // wishlist logic
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore(
    (state) => state
  );

  const currentVariant =
    (product as any)?.defaultVariant || product?.variants?.[0] || null;

  const isInWishlist = wishlist.some(
    (w) =>
      w.productId === product?._id &&
      (w.variantId ?? null) === (currentVariant?._id ?? null)
  );

  function addToWishlistHandler() {
    if (!product || !currentVariant) return;
    if (isInWishlist) return;
    addToWishlist(product, currentVariant);
  }

  function removeFromWishlistHandler() {
    if (!product || !currentVariant) return;
    removeFromWishlist(product._id, currentVariant._id ?? null);
  }

  // qty counter
  function incrementCount() {
    setCount((c) => c + 1);
  }
  function decrementCount() {
    setCount((c) => (c > 1 ? c - 1 : c));
  }

  if (status === "pending") return <div>Loading...</div>;
  if (status === "error") return <div>error...</div>;

  return (
    <section className="w-[80vw] mx-auto mt-8">
      <div className="grid grid-cols-2 gap-4 h-[60vh] max-h-[600px]">
        {product && <ProductMedia product={product} />}
        <article>
          <div className="border-b pb-3">
            {/* Product name */}
            <h1 className="text-3xl font-semibold mb-1">{product?.name}</h1>

            {/* --- BRAND: displayed below the name --- */}
            {product?.brand ? (
              <div className="text-sm font-medium text-slate-700 mb-2">
                {product.brand}
              </div>
            ) : (
              /* If you prefer a muted placeholder, uncomment next line */
              // <div className="text-sm text-gray-400 mb-2">Brand not specified</div>
              null
            )}

            {/* Ratings */}
            <RatingsStarView rating={product?.ratings || 0} />
          </div>

          <div className="mt-6 border-b pb-6">
            <ProductPrice product={product} />
            <ProductPageBtns
              decrementCount={decrementCount}
              incrementCount={incrementCount}
              addToCartHandler={addToCartHandler}
              count={count}
              isInWishlist={isInWishlist}
              addToWishlistHandler={addToWishlistHandler}
              removeFromWishlistHandler={removeFromWishlistHandler}
            />
          </div>

          <div className="mt-5 border-t-slate-200">
            <p>{product?.description}</p>
          </div>
        </article>
      </div>

      {/* bottom info section */}
      <ProductDetailsInfo product={product} />
    </section>
  );
}
