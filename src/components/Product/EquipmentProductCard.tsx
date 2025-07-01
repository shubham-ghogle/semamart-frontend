import { Link } from "react-router";
import { Product } from "../../Types/types";
import { IoMdCart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const productDiscount = Math.floor(
    ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
  );

  const addProduct = useCartStore((state) => state.addToCart);
  const { addToWishlist, wishlist, removeFromWishlist } = useWishlistStore((state) => state);

  const isInWishlist = wishlist.some((el) => el._id === product._id);

  function handleAddCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    addProduct({ product, qty: 1 });
  }

  function toggleWishlist(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    isInWishlist ? removeFromWishlist(product._id) : addToWishlist(product);
  }

  const imageSrc = product.images?.[0]
    ? `/baseUrl/${product.images[0]}`
    : "/image60.png";

  return (
    <article className="w-[220px] rounded-lg border bg-white shadow hover:shadow-md transition relative p-3 flex flex-col justify-between h-[360px]">
      <Link to={`/product/${product._id}`} className="flex flex-col h-full">
        {/* Discount badge */}
        {productDiscount > 0 && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-500 text-xs font-semibold px-3 py-0.5 rounded-full">
            -{productDiscount}%
          </span>
        )}

        {/* Product image */}
        <div className="w-full h-48 flex items-center justify-center">
          <img
            src={imageSrc}
            alt={product.name}
            className="max-h-full object-contain"
          />
        </div>

        {/* Title */}
        <h3 className="mt-3 text-sm font-medium text-gray-800 truncate">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mt-1 flex gap-0.5 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-orange-400 text-sm leading-none">
              {i < Math.round(product.ratings ?? 0) ? "★" : "☆"}
            </span>
          ))}
        </div>

        {/* Bottom row: price + wishlist + cart */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="line-through text-xs text-gray-400">
              ₹{product.originalPrice}
            </span>
            <span className="text-base font-bold text-gray-900">
              ₹{product.discountPrice}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleWishlist} className="text-xl text-gray-500 hover:text-red-500">
              {isInWishlist ? <FaHeart className="text-red-500" /> : <CiHeart />}
            </button>
            <button
              onClick={handleAddCart}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-600 text-white hover:bg-teal-700"
            >
              <IoMdCart className="text-lg" />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
