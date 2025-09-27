// store/cartStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, Variant } from "../Types/types";

export type PaymentSlip = {
  basePrice: number;   // per-piece price
  qty: number;         // total pieces in line
  total: number;       // total excluding GST (basePrice * qty)
  gstPercent: number;
  gstAmount: number;
  grandTotal: number;  // total including GST
};

export type CartItem = {
  productId: string | Product;
  variantId: string | Variant | null;
  qty: number;               // total pieces
  shopId: string;
  taxClass?: number;
  price: number;             // per-piece price
  paymentslip: PaymentSlip;
  // Optional full objects for UI convenience
  product?: Product;
  variant?: Variant;
};

interface CartStore {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "paymentslip">) => void;
  removeFromCart: (productId: string, variantId: string | null) => void;
  changeQyt: (productId: string, variantId: string | null, amount: 1 | -1) => void;
  clearCart: () => void;
}

function buildSlip(perPiece: number, qty: number, gstPercent: number): PaymentSlip {
  const total = perPiece * qty;
  const gstAmount = (gstPercent * total) / 100;
  return {
    basePrice: perPiece,
    qty,
    total,
    gstPercent,
    gstAmount,
    grandTotal: total + gstAmount,
  };
}

function resolvePerPiece(item: Omit<CartItem, "paymentslip">, newQty: number): number {
  let perPiece = item.price;
  const bulk = (item.variant && Array.isArray((item.variant as any).bulkOrders))
    ? (item.variant as any).bulkOrders
    : [];

  if (bulk.length > 0) {
    for (const b of bulk) {
      if (newQty >= b.qty) {
        const candidate = b.price / Math.max(b.qty, 1);
        perPiece = Math.min(perPiece, candidate);
      }
    }
  }
  return perPiece;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],

      addToCart: (item) => {
        set((state) => {
          const itemProdId =
            typeof item.productId === "string" ? item.productId : (item.productId as any)?._id;
          const itemVarId =
            typeof item.variantId === "string" ? item.variantId : (item.variantId as any)?._id;
          const gstPercent = item.taxClass ?? 0;

          const existingIdx = state.cart.findIndex((el) => {
            const elProdId =
              typeof el.productId === "string" ? el.productId : (el.productId as any)?._id;
            const elVarId =
              typeof el.variantId === "string" ? el.variantId : (el.variantId as any)?._id;
            return elProdId === itemProdId && elVarId === itemVarId;
          });

          if (existingIdx !== -1) {
            // merge with existing
            const updated = [...state.cart];
            const old = updated[existingIdx];
            const newQty = old.qty + item.qty;
            const perPiece = resolvePerPiece(item, newQty);

            updated[existingIdx] = {
              ...old,
              qty: newQty,
              price: perPiece,
              paymentslip: buildSlip(perPiece, newQty, gstPercent),
            };
            return { cart: updated };
          }

          // new item
          const perPiece = resolvePerPiece(item, item.qty);
          return {
            cart: [
              ...state.cart,
              {
                ...item,
                price: perPiece,
                paymentslip: buildSlip(perPiece, item.qty, gstPercent),
              },
            ],
          };
        });
      },

      removeFromCart: (productId, variantId) =>
        set((state) => ({
          cart: state.cart.filter((item) => {
            const elProdId =
              typeof item.productId === "string" ? item.productId : (item.productId as any)?._id;
            const elVarId =
              typeof item.variantId === "string" ? item.variantId : (item.variantId as any)?._id;
            return !(elProdId === productId && elVarId === variantId);
          }),
        })),

      changeQyt: (productId, variantId, amount) =>
        set((state) => {
          const updated = state.cart
            .map((item) => {
              const elProdId =
                typeof item.productId === "string" ? item.productId : (item.productId as any)?._id;
              const elVarId =
                typeof item.variantId === "string" ? item.variantId : (item.variantId as any)?._id;

              if (elProdId === productId && elVarId === variantId) {
                const newQty = item.qty + amount;
                if (newQty <= 0) return null;

                const perPiece = resolvePerPiece(item, newQty);
                return {
                  ...item,
                  qty: newQty,
                  price: perPiece,
                  paymentslip: buildSlip(perPiece, newQty, item.taxClass ?? 0),
                };
              }
              return item;
            })
            .filter((x): x is CartItem => x !== null);

          return { cart: updated };
        }),

      clearCart: () => set(() => ({ cart: [] })),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
