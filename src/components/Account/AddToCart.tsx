import { useNavigate } from "react-router-dom";
import { CartItem, useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { toast } from "react-toastify";

export default function AddToCart() {
  const cart = useCartStore((state) => state.cart);
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // Sum only discounted prices × quantity
  const totalPayable = cart.reduce(
    (acc, item) => acc + item.qty * item.product.discountPrice,
    0
  );

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
    navigate("/checkout");
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Cart Items */}
        <div className="flex-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">My Cart ({cart.length})</h2>

          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-16">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-2">Your cart is empty!</h3>
              <p>Browse our products and add something to your cart.</p>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <CartSingle key={item.product._id} data={item} />
              ))}
            </>
          )}
        </div>

        {/* Price Summary - Only total */}
        {cart.length > 0 && (
          <div className="w-full md:w-80 bg-white rounded-lg shadow p-4 h-fit sticky top-6">
            <h3 className="text-lg font-semibold mb-4">PRICE DETAILS</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between font-semibold text-black text-base">
                <span>Total Amount</span>
                <span>₹{totalPayable.toLocaleString()}</span>
              </div>

              <button
                onClick={checkoutHandler}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-4 py-3 rounded font-semibold cursor-pointer"
              >
                PLACE ORDER
              </button>
            </div>
          </div>
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

  const originalPrice = product.originalPrice ?? product.discountPrice;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - product.discountPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="flex gap-4 py-6 border-b border-gray-200">
      {/* Left: Product Image */}
      <div className="w-28 flex-shrink-0">
        <img
          src={product.images?.[0] || "/default-image.png"}
          alt={product.name}
          className="w-24 h-24 object-cover rounded border"
        />
      </div>

      {/* Right: Product Info */}
      <div className="flex flex-col flex-1 justify-between">
        {/* Top Row: Name + Delivery */}
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-base font-semibold text-gray-900">{product.name}</h4>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Delivery in 4 - 5 days
          </span>
        </div>

        {/* Seller, Price, Discount */}
        <div className="text-sm text-gray-600 mb-2">
          <p>For Men &amp; Women, Black</p>
          <p>
            Seller: <span className="font-medium text-gray-800">Good Friend</span>
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="line-through text-gray-400">₹{originalPrice}</span>
            <span className="font-semibold text-lg text-gray-900">₹{product.discountPrice}</span>
            {discountPercent > 0 && (
              <span className="text-green-600 font-semibold">{discountPercent}% OFF</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-300 mb-2" />

        {/* Bottom Row: Quantity + Save & Remove */}
        <div className="flex items-center gap-6">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 border rounded-md overflow-hidden">
            <button
              onClick={() => changeQyt(product._id, -1)}
              disabled={data.qty === 1}
              className={`w-8 h-8 text-lg font-bold ${
                data.qty === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              −
            </button>
            <div className="px-3 text-sm font-medium">{data.qty}</div>
            <button
              onClick={() => changeQyt(product._id, 1)}
              className="w-8 h-8 text-lg font-bold bg-white hover:bg-gray-100"
            >
              +
            </button>
          </div>

          {/* Save For Later */}
          <button className="text-sm text-gray-700 cursor-pointer">SAVE FOR LATER</button>

          {/* Remove */}
          <button
            onClick={() => removeFromCart(product._id)}
            className="text-sm text-red-600 cursor-pointer"
          >
            REMOVE
          </button>
        </div>
      </div>
    </div>
  );
};
