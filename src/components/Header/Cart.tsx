// Cart.tsx
import { Link } from "react-router-dom";
import { IoBagHandleOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { CartItem, useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

type CartProps = {
  cartOpenHandler: () => void;
};

export default function Cart({ cartOpenHandler }: CartProps) {
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // ✅ calculate total price using variant OR fallback product price
  const totalPrice = cart.reduce((acc, item) => {
    const price =
      item.variant?.discountPrice ??
      item.variant?.originalPrice ??
      (item.product?.variants?.[0]?.discountPrice ??
        item.product?.variants?.[0]?.originalPrice ??
        0);
    return acc + item.qty * price;
  }, 0);

  function checkoutHandler() {
    if (!user) {
      toast.warning("Please login to continue", { position: "top-left" });
      return;
    }
    if (user.role === "Admin") {
      toast.warning("Please login as customer to continue", {
        position: "top-left",
      });
      return;
    }

    cartOpenHandler();
    navigate("/checkout");
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl rounded-l-3xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500">
          <div className="flex items-center gap-2 text-white">
            <IoBagHandleOutline size={28} />
            <h2 className="text-2xl font-bold">{cart.length} item(s)</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Clear All */}
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="px-3 py-1 text-sm font-semibold bg-white/20 text-white rounded-full hover:bg-white/30 transition disabled:opacity-50"
            >
              Clear All
            </button>
            {/* Close */}
            <RxCross1
              size={24}
              className="text-white cursor-pointer hover:opacity-80 transition"
              onClick={cartOpenHandler}
            />
          </div>
        </header>

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center px-8 text-gray-500">
            <div className="text-6xl mb-4 animate-pulse">🛒</div>
            <h3 className="text-xl font-semibold mb-2">
              Your cart is empty!
            </h3>
            <p className="text-center">
              Browse our products and add something to your cart.
            </p>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 p-4 space-y-4">
              {cart.map((item) => (
                <CartSingle
                  key={`${item.productId}-${item.variantId ?? "no-variant"}`}
                  data={item}
                />
              ))}
            </div>

            {/* Footer / Checkout */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-gray-700">
                  Subtotal
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
              <button
                onClick={checkoutHandler}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition shadow"
              >
                Checkout Now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type CartSingleProps = {
  data: CartItem;
};

const CartSingle = ({ data }: CartSingleProps) => {
  const { removeFromCart, changeQyt } = useCartStore();

  const product = data.product;
  const variant = data.variant;

  if (!product) return null; // safeguard

  // ✅ image handling
  const imageUrl =
    variant?.thumbnail
      ? `/images/${variant.thumbnail}`
      : product.images?.[0]
      ? `/images/${product.images[0]}`
      : "/placeholder.png";

  // ✅ price handling
  const unitPrice =
    variant?.discountPrice ??
    variant?.originalPrice ??
    product.variants?.[0]?.discountPrice ??
    product.variants?.[0]?.originalPrice ??
    0;

  const totalPrice = unitPrice * data.qty;

  // ✅ safe IDs
  const productId =
    typeof data.productId === "string" ? data.productId : data.productId?._id;
  const variantId =
    typeof data.variantId === "string" ? data.variantId : data.variantId?._id;

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow-md p-3 hover:shadow-lg transition">
      {/* Product Link & Image */}
      <Link
        to={`/product/${productId}`}
        className="flex items-center gap-3 flex-1"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-20 h-20 object-cover rounded-lg border"
        />

        <div className="flex flex-col flex-1">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            ₹{unitPrice.toLocaleString()} × {data.qty}
          </p>
          <p className="text-sm font-bold text-red-600 mt-1">
            ₹{totalPrice.toLocaleString()}
          </p>
        </div>
      </Link>

      {/* Quantity Controls */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (productId) changeQyt(productId, variantId ?? null, 1);
          }}
          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full grid place-items-center transition"
        >
          <HiPlus size={16} />
        </button>
        <span className="text-sm font-medium">{data.qty}</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (productId) changeQyt(productId, variantId ?? null, -1);
          }}
          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full grid place-items-center transition"
        >
          <HiOutlineMinus size={16} />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (productId) removeFromCart(productId, variantId ?? null);
        }}
        className="text-gray-400 hover:text-red-500 transition ml-2"
        aria-label="Remove item"
      >
        <RxCross1 size={20} />
      </button>
    </div>
  );
};
