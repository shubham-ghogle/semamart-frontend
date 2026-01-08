import { IoBagHandleOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
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

  // ✅ Main totals calculation: prefer paymentslip values, fallback to item.price
  const { subtotal, gstTotal, grandTotal } = cart.reduce(
    (acc, item) => {
      const qty = Number(item.qty ?? 1);
      const taxRate = Number(item.taxClass ?? 0);

      // prefer stored per-piece price or paymentslip base
      const unitBase =
        Number(item.price) ||
        Number(item.paymentslip?.basePrice) ||
        Number(item.variant?.discountPrice) ||
        Number(item.variant?.originalPrice) ||
        Number(item.product?.variants?.[0]?.discountPrice) ||
        Number(item.product?.variants?.[0]?.originalPrice) ||
        0;

      // prefer stored paymentslip totals if present (already GST-excluded)
      const lineTotalExGST =
        Number(item.paymentslip?.total) || unitBase * qty;

      const gstAmount =
        Number(item.paymentslip?.gstAmount) || (lineTotalExGST * taxRate) / 100;

      const lineGrand = Number(item.paymentslip?.grandTotal) || lineTotalExGST + gstAmount;

      acc.subtotal += lineTotalExGST;
      acc.gstTotal += gstAmount;
      acc.grandTotal += lineGrand;

      return acc;
    },
    { subtotal: 0, gstTotal: 0, grandTotal: 0 }
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

    cartOpenHandler();
    navigate("/checkout");
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl rounded-l-3xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-[#1C647C]">
          <div className="flex items-center gap-2 text-white">
            <IoBagHandleOutline size={28} />
            <h2 className="text-2xl font-bold">{cart.length} item(s)</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="px-3 py-1 text-sm font-semibold bg-white/20 text-white rounded-full hover:bg-white/30 transition disabled:opacity-50"
            >
              Clear All
            </button>
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
            <h3 className="text-xl font-semibold mb-2">Your cart is empty!</h3>
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
            <div className="px-6 py-4 bg-gray-50 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-700">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-700">GST</span>
                <span className="font-semibold text-green-600">
                  ₹{gstTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-800">
                  Total (Incl. GST)
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                onClick={checkoutHandler}
                className="w-full text-white py-3 rounded-2xl font-semibold text-lg shadow mt-3"
                style={{
                  background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)",
                }}
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
  if (!product) return null;

  const imageUrl =
    (variant && (variant as any).thumbnail)
      ? `/images/${(variant as any).thumbnail}`
      : product.images?.[0]
      ? `/images/${product.images[0]}`
      : "/default-image.png";

  const unitPrice =
    Number(data.price) ||
    Number(data.paymentslip?.basePrice) ||
    Number((variant as any)?.discountPrice) ||
    Number((variant as any)?.originalPrice) ||
    Number(product.variants?.[0]?.discountPrice) ||
    Number(product.variants?.[0]?.originalPrice) ||
    0;

  const qty = data.qty ?? 1;
  const taxRate = Number(data.taxClass ?? 0);

  const lineTotalEx = unitPrice * qty;
  const gstAmount = (lineTotalEx * taxRate) / 100;
  // const lineTotalIncl = lineTotalEx + gstAmount;

  const productId =
    typeof data.productId === "string" ? data.productId : (data.productId as any)?._id;
  const variantId =
    typeof data.variantId === "string" ? data.variantId : (data.variantId as any)?._id;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 py-4 border-b border-gray-200">
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={imageUrl}
          alt={(product as any).name}
          className="w-full h-full object-cover rounded border"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
          <div>
            <h4 className="text-base font-semibold text-gray-900">
              {(product as any).name}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {(variant as any)?.colorOption ? `${(variant as any).colorOption}` : ""}
              {(variant as any)?.size ? ` | Size: ${(variant as any).size}` : ""}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Unit: ₹{unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              ₹{lineTotalEx.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            {taxRate > 0 && (
              <p className="text-xs text-gray-500">
                GST {taxRate}%: ₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>

        {/* Quantity & Remove */}
        <div className="flex items-center gap-4 mt-3">
          {/* Qty controls */}
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => productId && changeQyt(productId, variantId ?? null, -1)}
              disabled={qty === 1}
              className={`w-8 h-8 text-lg font-bold ${
                qty === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100"
              }`}
            >
              −
            </button>
            <div className="px-3 text-sm font-medium">{qty}</div>
            <button
              onClick={() => productId && changeQyt(productId, variantId ?? null, 1)}
              className="w-8 h-8 text-lg font-bold bg-white hover:bg-gray-100"
            >
              +
            </button>
          </div>

          {/* Remove button */}
          <button
            onClick={() => productId && removeFromCart(productId, variantId ?? null)}
            className="text-sm text-red-600 hover:underline"
          >
            REMOVE
          </button>
        </div>
      </div>
    </div>
  );
};
