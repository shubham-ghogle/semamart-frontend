import { Link } from "react-router-dom";
import { IoHeart } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { createPortal } from "react-dom";
import { useWishlistStore, WishlistItem } from "../../store/wishlistStore";
import { useCartStore } from "../../store/cartStore";
import { useUserStore } from "@/store/userStore";
import { API_URL, BASE_URL } from "@/data";

type WishlistProps = {
  wishlistOpenHandler: () => void;
};

export default function Wishlist({
  wishlistOpenHandler,
}: WishlistProps) {
  const wishlist = useWishlistStore((s) => s.wishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  return createPortal(
    <article className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl rounded-l-3xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-[#1C647C]">
          <div className="flex items-center gap-2 text-white">
            <IoHeart size={28} />

            <h2 className="text-2xl font-bold">
              {wishlist.length} item
              {wishlist.length !== 1 && "s"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear All */}
            <button
              onClick={clearWishlist}
              disabled={wishlist.length === 0}
              className="px-3 py-1 text-sm font-semibold bg-white/20 text-white rounded-full hover:bg-white/30 transition disabled:opacity-50"
            >
              Clear All
            </button>

            {/* Close */}
            <button
              onClick={wishlistOpenHandler}
              className="p-1 rounded-full hover:bg-white/20 transition"
              aria-label="Close wishlist"
            >
              <RxCross1
                size={24}
                className="text-white"
              />
            </button>
          </div>
        </header>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center px-8 text-gray-500">
            <div className="text-6xl mb-4 animate-pulse">
              💔
            </div>

            <h3 className="text-xl font-semibold mb-2">
              Your wishlist is empty
            </h3>

            <p className="text-center">
              Browse products and save your favorites
              for later.
            </p>

            <button
              onClick={() => {
                wishlistOpenHandler();
                window.location.href = "/";
              }}
              className="mt-5 bg-[#1C647C] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#14525F] transition"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 p-4 space-y-4">
            {wishlist.map((item: WishlistItem) => (
              <WishlistItemCard
                key={`${item.productId}-${item.variantId ?? "no-variant"}`}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </article>,
    document.body
  );
}

type WishlistItemProps = {
  item: WishlistItem;
};

function WishlistItemCard({
  item,
}: WishlistItemProps) {
  const removeFromWishlist = useWishlistStore(
    (s) => s.removeFromWishlist
  );

  const addToCart = useCartStore(
    (s) => s.addToCart
  );

  const {
    product,
    variant,
    price,
    productId,
    variantId,
    taxClass,
    shopId,
  } = item;

  // ✅ Fixed Image URL
  const imageUrl = variant?.thumbnail
    ? variant.thumbnail.startsWith("http")
      ? variant.thumbnail
      : `${BASE_URL}images/${variant.thumbnail}`
    : product.images?.[0]
    ? product.images[0].startsWith("http")
      ? product.images[0]
      : `${BASE_URL}images/${product.images[0]}`
    : "/placeholder.png";

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition relative">
      {/* Product Link */}
      <Link
        to={`/product/${productId}`}
        className="flex items-center gap-4 flex-1"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-20 h-20 object-cover rounded-lg border"
          onError={(e) => {
            (
              e.currentTarget as HTMLImageElement
            ).src = "/placeholder.png";
          }}
        />

        <div className="flex flex-col flex-1">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 mt-1">
            ₹
            {price.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </Link>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          removeFromWishlist(
            productId,
            variantId ?? null
          );
        }}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Remove from wishlist"
      >
        <RxCross1
          size={20}
          className="text-gray-500 hover:text-red-500 transition"
        />
      </button>

      {/* Add To Cart */}
      {variant?.stock ? (
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const user =
              useUserStore.getState().user;

            if (!user?._id) {
              console.error("User not logged in");
              return;
            }

            // Add to cart
            await addToCart({
              productId,
              variantId,
              product,
              variant,
              qty: 1,
              price,
              shopId: shopId ?? "",
              taxClass: taxClass ?? 0,
            });

            try {
              const res = await fetch(
                API_URL + "cart/add",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify({
                    user_id:
                      user?._id || "guest",
                    product_id: productId,
                    variant_id:
                      variantId ?? null,
                    qty: 1,
                  }),
                }
              );

              const data = await res.json();

              if (!data.success) {
                console.error(
                  "Failed to save cart:",
                  data.message
                );
              }
            } catch (err) {
              console.error(
                "Error calling cart API:",
                err
              );
            }

            // Remove from wishlist
            removeFromWishlist(
              productId,
              variantId ?? null
            );
          }}
          className="mt-4 w-full py-2 rounded-2xl font-semibold text-white text-base"
          style={{
            background:
              "linear-gradient(270deg, #FCB320 0%, #F04526 100%)",
          }}
        >
          Add to Cart
        </button>
      ) : (
        <button
          disabled
          className="mt-4 w-full py-2 rounded-2xl font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
        >
          Out of Stock
        </button>
      )}
    </div>
  );
}