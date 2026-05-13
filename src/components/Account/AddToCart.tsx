import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem, useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { toast } from "react-toastify";
import RelatedProducts from "../../components/UIComponents/RelatedProductCard";
import UpsellCrossSellBlock from "../../components/UIComponents/UpsellCrossSellBlock";
import { getCartLinePricing } from "@/lib/utils";
import { BASE_URL } from "@/data";


// -------------------
// Main AddToCart Component
// -------------------
export default function AddToCart() {
  const cart = useCartStore((state) => state.cart);
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // ✅ Track first product by ID to avoid shuffling
  const firstProduct = useMemo(() => {
    if (!cart.length) return null;
    const firstId = cart[0].product?._id;
    return cart.find((i) => i.product?._id === firstId)?.product || null;
  }, [cart]);

  // ✅ Calculate totals using data.price (bulk-aware)
  const { subTotal, totalGST, grandTotal } = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        const { subtotal, gstAmount, total } = getCartLinePricing(item);
        acc.subTotal += subtotal;
        acc.totalGST += gstAmount;
        acc.grandTotal += total;
        return acc;
      },
      { subTotal: 0, totalGST: 0, grandTotal: 0 }
    );
  }, [cart]);

  const { upsellLinks, crosssellLinks } = useMemo(() => {
    const allUpsells = cart.flatMap((item) => (item.product as any)?.upsells || []);
    const allCross = cart.flatMap((item) => (item.product as any)?.crosssells || []);
    return {
      upsellLinks: [...new Set(allUpsells)],
      crosssellLinks: [...new Set(allCross)],
    };
  }, [cart]);

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
          <h2 className="text-xl font-semibold mb-4">
            My Cart ({cart.length})
          </h2>

          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-16">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-2">
                Your cart is empty!
              </h3>
              <p>Browse our products and add something to your cart.</p>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <CartSingle
                  key={`${item.productId}-${item.variantId ?? "no-variant"}`}
                  data={item}
                />
              ))}
            </>
          )}
        </div>

        {/* Price Summary */}
        {cart.length > 0 && (
          <div className="w-full md:w-80 bg-white rounded-lg shadow p-4 h-fit sticky top-6">
            <h3 className="text-lg font-semibold mb-4">PRICE DETAILS</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal (Excl. GST)</span>
                <span>
                  ₹
                  {subTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total GST</span>
                <span>
                  ₹
                  {totalGST.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-black text-base">
                <span>Grand Total (Incl. GST)</span>
                <span>
                  ₹
                  {grandTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <button
                onClick={checkoutHandler}
                className="w-full text-white mt-4 py-3 rounded font-semibold cursor-pointer shadow"
                style={{
                  background: "linear-gradient(270deg, #FCB320 0%, #F04526 100%)",
                }}
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {firstProduct && (
        <div className="space-y-8 mt-12 w-full max-w-[1600px] mx-auto px-4">
          <hr className="border-t border-gray-400" />
          <h2 className="font-bold text-2xl mt-6 text-center text-[#1C647C]">
            Related Products
          </h2>
          <div className="flex flex-wrap justify-center mt-8">
            <RelatedProducts
              productType={firstProduct.productType}
              productId={firstProduct._id}
            />
          </div>

          <UpsellCrossSellBlock
            upsells={upsellLinks}
            crosssells={crosssellLinks}
            titlePrefix="Cart"
          />
        </div>
      )}
    </div>
  );
}

// -------------------
// Cart Item Component
// -------------------
type CartSingleProps = {
  data: CartItem;
};

const CartSingle = React.memo(({ data }: CartSingleProps) => {
  const { removeFromCart, changeQyt } = useCartStore();

  const product = data.product;
  const variant = data.variant;

  if (!product) return null;

  const imageUrl =
    (variant && (variant as any).thumbnail)
      ? `${BASE_URL}images/${(variant as any).thumbnail}`
      : product.images?.[0]
      ? `${BASE_URL}images/${product.images[0]}`
      : "/placeholder.png";

  const { qty, taxRate: gstRate, unitBase: basePrice, subtotal: totalBase, gstAmount: totalGST, total: totalInclGST, gstPerUnit: gstAmountPerPiece } =
    getCartLinePricing(data);

  const originalPrice =
    variant?.originalPrice ?? product.variants?.[0]?.originalPrice ?? basePrice;
  const discountPercent =
    originalPrice && basePrice
      ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
      : 0;

  const productId =
    typeof data.productId === "string" ? data.productId : data.productId?._id;
  const variantId =
    typeof data.variantId === "string" ? data.variantId : data.variantId?._id;

  return (
    <div className="flex gap-4 py-6 border-b border-gray-200">
      <div className="w-28 flex-shrink-0">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-24 h-24 object-cover rounded border"
        />
      </div>

      <div className="flex flex-col flex-1 justify-between">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-base font-semibold text-gray-900">
            {product.name}
          </h4>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Delivery in 4 - 5 days
          </span>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          <p>
            {variant?.colorOption ? `${variant.colorOption}` : ""}
            {variant?.size ? ` | Size: ${variant.size}` : ""}
          </p>

          <div className="space-y-1 mt-2">
            <div>
              Unit Price (Excl. GST): ₹
              {basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ×{" "}
              {qty} ={" "}
              <strong>
                ₹{totalBase.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div>GST Rate: {gstRate}%</div>
            <div>
              GST Amount: ₹
              {gstAmountPerPiece.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ×{" "}
              {qty} = <strong>₹{totalGST.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="font-semibold text-gray-900">
              Price (Incl. GST): ₹{totalInclGST.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {discountPercent > 0 && (
            <span className="text-green-600 font-semibold mt-1 block">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <hr className="border-gray-300 mb-2" />

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 border rounded-md overflow-hidden">
            <button
              onClick={() =>
                productId && changeQyt(productId, variantId ?? null, -1)
              }
              disabled={qty === 1}
              className={`w-8 h-8 text-lg font-bold ${
                qty === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              −
            </button>
            <div className="px-3 text-sm font-medium">{qty}</div>
            <button
              onClick={() =>
                productId && changeQyt(productId, variantId ?? null, 1)
              }
              className="w-8 h-8 text-lg font-bold bg-white hover:bg-gray-100"
            >
              +
            </button>
          </div>

          <button
            onClick={() =>
              productId && removeFromCart(productId, variantId ?? null)
            }
            className="text-sm text-red-600 cursor-pointer"
          >
            REMOVE
          </button>
        </div>
      </div>
    </div>
  );
});
