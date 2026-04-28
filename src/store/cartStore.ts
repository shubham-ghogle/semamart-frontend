// store/cartStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, Variant } from "../Types/types";
import { useUserStore } from "./userStore";
import { API_URL } from "@/data";
import { getAccountOwnerId } from "@/lib/utils";


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
  variant: Variant;
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
  // Use originalPrice if available
  let perPiece = item.variant.discountPrice ?? item.price; 

  const bulk = item.variant && Array.isArray((item.variant as any).bulkOrders)
    ? (item.variant as any).bulkOrders
    : [];

  if (bulk.length > 0) {
    const sortedBulk = bulk.sort((a: any, b: any) => a.qty - b.qty);
    let matchedTier = null;

    for (const b of sortedBulk) {
      if (newQty >= b.qty) matchedTier = b;
      else break;
    }

    if (matchedTier) {
      perPiece = matchedTier.price / Math.max(matchedTier.qty, 1);
    }
  }

  return perPiece;
}



export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],

      addToCart: async (item) => {
        const user = useUserStore.getState().user;
        const accountOwnerId = getAccountOwnerId(user);
            if (!accountOwnerId) {
              console.error("User not logged in");
              return;
            }
            const itemProdId =
    typeof item.productId === "string" ? item.productId : (item.productId as any)?._id;
  const itemVarId =
    typeof item.variantId === "string" ? item.variantId : (item.variantId as any)?._id;
  
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
          //console.log(perPiece);
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
        try {
        await fetch(API_URL+"cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  user_id: accountOwnerId,
  product_id: itemProdId,
  variant_id: itemVarId,
  qty: item.qty,
}),

    });
  } catch (error) {
    console.error("Failed to add to cart API:", error);
  }
      },

    removeFromCart: async (productId, variantId) => {
       const user = useUserStore.getState().user;
       const accountOwnerId = getAccountOwnerId(user);

  if (!accountOwnerId) {
    console.error("User not logged in");
    return;
  }
        try {
       
          await fetch(API_URL+`cart/${accountOwnerId}/${productId}/${variantId}`, {
            method: "DELETE",
          });

        
          set((state) => ({
            cart: state.cart.filter((item) => {
              const elProdId =
                typeof item.productId === "string"
                  ? item.productId
                  : item.productId?._id;

              const elVarId =
                typeof item.variantId === "string"
                  ? item.variantId
                  : item.variantId?._id;

              return !(elProdId === productId && elVarId === variantId);
            }),
          }));
        } catch (error) {
          console.error("Remove cart error:", error);
        }
      },



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

      // clearCart: () => set(() => ({ cart: [] })),
  
     clearCart: async () => {
  const user = useUserStore.getState().user;
  const accountOwnerId = getAccountOwnerId(user);

  if (!accountOwnerId) {
    console.error("User not logged in");
    return;
  }

  try {
    const response = await fetch(API_URL+`cart/clear/${accountOwnerId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to clear cart");
    }

    set({ cart: [] });
  } catch (error) {
    console.error("Clear Cart failed:", error);
    throw error;
  }
},

    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
