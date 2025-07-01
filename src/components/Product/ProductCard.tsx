import { Link } from "react-router";
import { Product } from "../../Types/types";
import { IoMdCart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { FaHeart, FaRegEye } from "react-icons/fa";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
// import RatingsStarView from "../UI/RatingStarView";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const productDiscount = Math.floor(
    ((product.originalPrice - product.discountPrice) / product.originalPrice) *
    100,
  );

  const addProduct = useCartStore(state => state.addToCart)
  const { addToWishlist, wishlist, removeFromWishlist } = useWishlistStore(state => state)

  function handleAddCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    addProduct({ product, qty: 1 })
  }

  function addToWishlistHandler(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    addToWishlist(product)
  }

  function removeWishlistHandler(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    removeFromWishlist(product._id)
  }

  const isInWishlist = wishlist.some(el => el._id === product._id)

  return (
    <article className="w-[220px] bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition">
  <Link to={`/product/${product._id}`} className="block px-4 pt-4 pb-3 text-center">
    {/* Discount Badge + Image */}
    <div className="relative mb-2">
      {productDiscount > 0 && (
        <span className="absolute top-1 left-1 bg-black text-white text-xs px-1.5 py-0.5 rounded-sm">
          -{productDiscount}%
        </span>
      )}
      <div className="h-36 flex items-center justify-center overflow-hidden">
        <img
          // src={`/baseUrl/${product.images[0] || ""}`}
          src="/image60.png"
          alt={product.name}
          className="h-full object-contain"
        />
      </div>
    </div>

    {/* Title */}
    <h3 className="text-gray-800 text-sm leading-tight h-9 overflow-hidden">
      {product.name}
    </h3>

    {/* Prices */}
    <div className="mt-1">
      <span className="block text-gray-400 line-through text-sm">
        ₹{product.originalPrice.toLocaleString()}
      </span>
      <span className="block text-black font-semibold text-base">
        ₹{product.discountPrice.toLocaleString()}
      </span>
    </div>

    {/* Add to Cart */}
    <button
      onClick={handleAddCart}
      className="mt-3 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-black py-1.5 rounded font-medium"
    >
      <IoMdCart className="text-lg" />
      <span>Add to cart</span>
    </button>

    {/* Wishlist */}
    {isInWishlist ? (
      <button
        onClick={removeWishlistHandler}
        className="mt-2 w-full flex items-center justify-center gap-1 text-sm text-red-500"
      >
        <FaHeart className="text-base" /> <span>Remove from Wishlist</span>
      </button>
    ) : (
      <button
        onClick={addToWishlistHandler}
        className="mt-2 w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-teal-500"
      >
        <CiHeart className="text-lg" /> <span>Add to Wishlist</span>
      </button>
    )}
  </Link>
</article>

  );
}
