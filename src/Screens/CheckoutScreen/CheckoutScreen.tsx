// src/Screens/CheckoutScreen/CheckoutScreen.tsx
import { useState } from "react";
import { useCartStore, CartItem } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import { Address, Seller } from "../../Types/types";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import RelatedProducts from "../../components/UIComponents/RelatedProductCard";
import { toast } from "react-toastify";
import { API_URL } from "@/data";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutScreen(): JSX.Element {
    const { user } = useUserStore((s) => s);

    const {
        cart,
        clearCart,
        changeQyt, // ✅ ADDED
        removeFromCart, // ✅ ADDED
    } = useCartStore((s) => s);

    const navigate = useNavigate();

    const [selectedAddressIndex, setSelectedAddressIndex] = useState<
        number | null
    >(null);

    const formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    });

    const address =
        selectedAddressIndex !== null
            ? user?.addresses?.[selectedAddressIndex]
            : null;

    const normalizeImage = (src?: string | null) => {
        if (!src) return null;
        if (
            src.startsWith("http://") ||
            src.startsWith("https://") ||
            src.startsWith("/")
        )
            return src;
        return `/images/${src}`;
    };

    // --- Helper: pick authoritative unit base price (same strategy as Cart) ---
    const getUnitBase = (item: CartItem) =>
        Number(item.price) ||
        Number(item.paymentslip?.basePrice) ||
        Number(item.variant?.discountPrice) ||
        Number(item.variant?.originalPrice) ||
        Number(item.product?.variants?.[0]?.discountPrice) ||
        Number(item.product?.variants?.[0]?.originalPrice) ||
        0;

    // --- Helper: compute per-line totals, preferring paymentslip when present ---
    const getLineTotals = (item: CartItem) => {
        const qty = Number(item.qty ?? 1);
        const unitBase = getUnitBase(item);
        const taxRate = Number(item.taxClass ?? 0);

        const lineTotalExGST =
            Number(item.paymentslip?.total) || unitBase * qty;

        const gstAmount =
            Number(item.paymentslip?.gstAmount) ||
            (lineTotalExGST * taxRate) / 100;

        const lineGrand =
            Number(item.paymentslip?.grandTotal) || lineTotalExGST + gstAmount;

        return {
            qty,
            unitBase,
            taxRate,
            lineTotalExGST,
            gstAmount,
            lineGrand,
        };
    };

    // ✅ Calculate totals using the same logic as cart
    const { subTotal, totalGST, grandTotal } = (cart || []).reduce(
        (acc, curr) => {
            const { lineTotalExGST, gstAmount, lineGrand } =
                getLineTotals(curr);
            acc.subTotal += lineTotalExGST;
            acc.totalGST += gstAmount;
            acc.grandTotal += lineGrand;
            return acc;
        },
        { subTotal: 0, totalGST: 0, grandTotal: 0 },
    );

    // Build payload using the same authoritative prices
    const cartToApi = (cart || []).map((el) => {
        const fallbackVariantId = el.product?.variants?.[0]?._id ?? null;
        const unitBase = getUnitBase(el);
        const gstAmountPerLine =
            Number(el.paymentslip?.gstAmount) ||
            (unitBase * (el.taxClass || 0)) / 100;
        const qty = el.qty ?? 1;

        return {
            shopId:
                typeof el.product?.shopId === "string"
                    ? el.product.shopId
                    : (el.product?.shopId as Seller)?._id,
            productId: el.product!._id,
            variantId: el.variant?._id ?? fallbackVariantId,
            qty: el.qty,
            totalPrice:
                Number(el.paymentslip?.grandTotal) ||
                (unitBase + (gstAmountPerLine / qty || 0)) * qty ||
                (unitBase + gstAmountPerLine) * qty,
            tax: el.taxClass || 0,
            unitPrice: unitBase,
        };
    });

    const [paymentMethod, setPaymentMethod] = useState("HDFC");

    const orderPayload = {
        cart: cartToApi,
        shippingAddress: address,
        user: user?._id ?? null,
        totalPrice: grandTotal,
        paymentMethod,
    };

    const {mutateAsync:getHdfcSession ,status:hdfcSessionStatus} = useMutation({
        mutationFn:(paymentGrpId:string) => createHdfcSession(paymentGrpId),
        onError:(err)=>{
            toast.error(err.message ?? "Failed to create order");
        },
        onSuccess:(data)=>{
            const paymentUrl = data.paymentLink
            window.location.href = paymentUrl
        }
    })

    const { mutateAsync, status } = useMutation({
        mutationFn: (data: any) => postOrder(data),
        onError: (err) => {
            toast.error(err.message ?? "Failed to create order");
        },
        onSuccess: async(data) => {
            if(paymentMethod!=="HDFC"){
                clearCart();
            }else{
                const paymentGroupId = (data as any).paymentGroupId as string
                await getHdfcSession(paymentGroupId)
            }
        },
    });

    async function handlePlaceOrder() {
        if (!address) {
            toast.warning(
                "Please select a shipping address before placing order.",
                {
                    position: "top-left",
                },
            );
            return;
        }

        for (const c of cart) {
            if (!c.product) return;
            const minMaxRule = c.product.minmaxrule as unknown as string;
            const parsedMinMaxRule = JSON.parse(minMaxRule) as {
                minQty: string;
                maxQty: string;
            };
            const minQty = parseInt(parsedMinMaxRule.minQty);
            if (!isNaN(minQty) && c.qty < minQty) {
                toast.error(
                    `${c.product.name} has the minimum order quantity of ${minQty}`,
                );
                return;
            }
        }

        await mutateAsync(orderPayload);
    }

    // ✅ Success screen (UNCHANGED)
    if (status === "success" && paymentMethod!== "HDFC") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
                <Confetti />
                <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-lg mx-4">
                    <h1 className="text-3xl font-bold text-green-600 mb-3">
                        🎉 Order Created Successful!
                    </h1>
                    <p className="text-gray-700 mb-4">
                        You can make payments for your order items by going in
                        your order history.
                    </p>
                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate("/")}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                        >
                            OK
                        </button>
                        <button
                            onClick={() => navigate("/account/orders")}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 ml-3"
                        >
                            Go to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!cart || cart.length === 0) {
        return (
            <div className="text-center mt-20">
                <h2 className="text-2xl font-semibold mb-4">
                    Your cart is empty
                </h2>
                <a href="/" className="text-blue-600 hover:underline">
                    Continue Shopping
                </a>
            </div>
        );
    }

    // ✅ Checkout Page UI
    return (
        <div className="mt-16 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
                {/* Items + Address */}
                <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Your Items</h2>

                    <div className="divide-y">
                        {cart.map((item) => {
                            const { qty, unitBase, taxRate, lineGrand } =
                                getLineTotals(item);

                            const productId =
                                typeof item.productId === "string"
                                    ? item.productId
                                    : (item.productId as any)?._id;

                            const variantId =
                                typeof item.variantId === "string"
                                    ? item.variantId
                                    : (item.variantId as any)?._id;

                            const thumb =
                                normalizeImage(item.variant?.thumbnail) ??
                                (item.product?.images?.[0]
                                    ? `/images/${item.product.images[0]}`
                                    : "/placeholder.png");

                            return (
                                <article
                                    key={`${productId}-${variantId ?? "nv"}`}
                                    className="flex items-center gap-4 py-4"
                                >
                                    <img
                                        src={thumb}
                                        alt={item.product?.name ?? "Product"}
                                        className="w-[80px] h-[80px] object-cover rounded shadow-sm"
                                    />

                                    <div className="flex-1">
                                        <h5 className="text-lg font-medium">
                                            {item.product?.name}
                                        </h5>

                                        <p className="text-gray-600">
                                            {qty} × {formatter.format(unitBase)}{" "}
                                            (Excl. GST)
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            GST: {taxRate}% •{" "}
                                            <strong>
                                                {formatter.format(lineGrand)}
                                            </strong>
                                        </p>

                                        {/* ✅ SAME +- REMOVE AS CART */}
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex border rounded overflow-hidden">
                                                <button
                                                    disabled={qty === 1}
                                                    onClick={() =>
                                                        changeQyt(
                                                            productId,
                                                            variantId ?? null,
                                                            -1,
                                                        )
                                                    }
                                                    className="w-8 h-8 bg-gray-100"
                                                >
                                                    −
                                                </button>

                                                <div className="px-3 flex items-center">
                                                    {qty}
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        changeQyt(
                                                            productId,
                                                            variantId ?? null,
                                                            1,
                                                        )
                                                    }
                                                    className="w-8 h-8 bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    removeFromCart(
                                                        productId,
                                                        variantId ?? null,
                                                    )
                                                }
                                                className="text-sm text-red-600"
                                            >
                                                REMOVE
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Address Section — UNCHANGED */}
                    <h2 className="text-xl font-semibold mt-8 mb-4">
                        Select Address
                    </h2>
                    {/* rest of your address code remains exactly same */}
                    {user?.addresses?.length ? (
                        <div className="flex flex-col gap-4">
                            {user.addresses.map((el: Address, i: number) => (
                                <article
                                    key={i}
                                    className={`rounded-lg cursor-pointer transition-all border p-4 ${
                                        selectedAddressIndex === i
                                            ? "border-yellow-500 bg-yellow-50 shadow-lg"
                                            : "border-gray-300 hover:border-gray-400"
                                    }`}
                                    onClick={() => setSelectedAddressIndex(i)}
                                >
                                    <div className="text-gray-700">
                                        <div>{el.instituteAddress1}</div>
                                        {el.instituteAddress2 && (
                                            <div>{el.instituteAddress2}</div>
                                        )}
                                        <div>
                                            {el.district}, {el.state} -{" "}
                                            {el.pincode}
                                        </div>
                                        {el.landmark && (
                                            <div>Landmark: {el.landmark}</div>
                                        )}
                                        {user?.phoneNumber && (
                                            <div>📞 {user.phoneNumber}</div>
                                        )}
                                    </div>
                                    {selectedAddressIndex === i && (
                                        <div className="text-green-600 font-medium mt-1 text-sm">
                                            ✓ Selected
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : null}
                </section>

                {/* Order Summary — UNCHANGED */}
                <aside className="bg-white p-6 rounded-lg shadow h-fit sticky top-20">
                    <h2 className="text-xl font-semibold mb-4">
                        Order Summary
                    </h2>
                    <div className="flex justify-between mb-2">
                        <span>Subtotal (Excl. GST)</span>
                        <span>{formatter.format(subTotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>Total GST</span>
                        <span>{formatter.format(totalGST)}</span>
                    </div>

                    <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Grand Total (Incl. GST)</span>
                        <span>{formatter.format(grandTotal)}</span>
                    </div>

                    <div className="font-semibold border-t pt-4">
                        <p>Payment Method</p>
                        <div className="flex justify-between pt-2">
                            <article className="flex items-center gap-2">
                                <Input
                                    className="h-4 w-4"
                                    checked={paymentMethod === "HDFC"}
                                    name="paymentMethod"
                                    type="radio"
                                    onChange={()=>setPaymentMethod("HDFC")}
                                />
                                <Label>HDFC</Label>
                            </article>
                            <article className="flex items-center gap-2">
                                <Input
                                    className="h-4 w-4"
                                    checked={paymentMethod === "MANUAL"}
                                    name="paymentMethod"
                                    type="radio"
                                    onChange={()=>setPaymentMethod("MANUAL")}
                                />
                                <Label>Manual</Label>
                            </article>
                        </div>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={status === "pending"}
                        className="w-full mt-6 py-3 text-white rounded"
                        style={{
                            background:
                                "linear-gradient(270deg, #FCB320 0%, #F04526 100%)",
                        }}
                    >
                        {(status === "pending" || hdfcSessionStatus==="pending")
                            ? "Creating Order..."
                            : "Create Order"}
                    </button>
                </aside>
            </div>

            {/* Related Products — UNCHANGED */}
            {cart.length > 0 && (
                <div className="space-y-8 mt-12 w-full max-w-[1600px] mx-auto px-4">
                    <hr className="border-t border-gray-400" />
                    <h2 className="font-bold text-2xl mt-6 text-center text-[#1C647C]">
                        Related Products
                    </h2>
                    <div className="flex flex-wrap justify-center mt-8">
                        <RelatedProducts
                            productType={(cart[0].product as any).productType}
                            productId={(cart[0].product as any)._id}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

async function postOrder(data: any) {
    const res = await fetch(API_URL + "order/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Could not create order");
    }
    const resData = await res.json()
    return resData as unknown;
}

async function createHdfcSession(paymentGroupId:string){
    console.log(paymentGroupId)
    const sessionRes = await fetch(API_URL + "order/create-payment-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             paymentGroupId,
          }),
        });

    if(!sessionRes.ok){
        throw new Error()
    }
    const data = await sessionRes.json()
    return data
}
