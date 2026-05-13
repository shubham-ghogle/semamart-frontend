// store/cartStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, Variant } from "../Types/types";
import { useUserStore } from "./userStore";
import { API_URL } from "@/data";
import { getAccountOwnerId } from "@/lib/utils";

export type PaymentSlip = {
  basePrice: number;
  qty: number;
  total: number;
  gstPercent: number;
  gstAmount: number;
  grandTotal: number;
};

export type CartItem = {
  productId: string | Product;
  variantId: string | Variant | null;
  qty: number;
  shopId: string;
  taxClass?: number;
  price: number;
  paymentslip: PaymentSlip;

  product?: Product;
  variant: Variant;
};

interface CartStore {
  cart: CartItem[];

  addToCart: (item: Omit<CartItem, "paymentslip">) => Promise<void>;

  syncCartTaxes: () => Promise<void>;

  removeFromCart: (
    productId: string,
    variantId: string | null
  ) => Promise<void>;

  changeQyt: (
    productId: string,
    variantId: string | null,
    amount: 1 | -1
  ) => void;

  clearCart: () => Promise<void>;
}

function buildSlip(
  perPiece: number,
  qty: number,
  gstPercent: number
): PaymentSlip {
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

function getProductId(
  item: Pick<CartItem, "productId"> | Omit<CartItem, "paymentslip">
) {
  return typeof item.productId === "string"
    ? item.productId
    : (item.productId as any)?._id;
}

function getVariantId(
  item: Pick<CartItem, "variantId"> | Omit<CartItem, "paymentslip">
) {
  return typeof item.variantId === "string"
    ? item.variantId
    : (item.variantId as any)?._id;
}

function resolveTaxRate(
  item: Partial<CartItem> & {
    product?: Product;
    taxClass?: number;
  }
): number {
  if (typeof item.taxClass === "number" && item.taxClass > 0) {
    return item.taxClass;
  }

  const productTax =
    (item.product as any)?.taxClass ??
    (item.product as any)?.gst ??
    0;

  return typeof productTax === "number" ? productTax : 0;
}

async function withResolvedTaxClass(
  item: Omit<CartItem, "paymentslip">
) {
  const currentTaxRate = resolveTaxRate(item);

  if (currentTaxRate > 0) {
    return {
      item,
      taxRate: currentTaxRate,
    };
  }

  const productId = getProductId(item);

  if (!productId) {
    return {
      item,
      taxRate: currentTaxRate,
    };
  }

  try {
    const response = await fetch(
      API_URL + "product/get-product/" + productId
    );

    if (!response.ok) {
      return {
        item,
        taxRate: currentTaxRate,
      };
    }

    const product = (await response.json()) as Product;

    const taxRate = resolveTaxRate({
      ...item,
      product,
      taxClass: (product as any).taxClass,
    });

    if (taxRate <= 0) {
      return {
        item,
        taxRate: currentTaxRate,
      };
    }

    return {
      item: {
        ...item,
        product,
        taxClass: taxRate,
      },
      taxRate,
    };
  } catch (error) {
    console.error("Failed to resolve product GST:", error);

    return {
      item,
      taxRate: currentTaxRate,
    };
  }
}

function resolvePerPiece(
  item: Omit<CartItem, "paymentslip">,
  newQty: number
): number {
  let perPiece = item.variant.discountPrice ?? item.price;

  const bulk =
    item.variant &&
    Array.isArray((item.variant as any).bulkOrders)
      ? (item.variant as any).bulkOrders
      : [];

  if (bulk.length > 0) {
    const sortedBulk = [...bulk].sort(
      (a: any, b: any) => a.qty - b.qty
    );

    let matchedTier = null;

    for (const b of sortedBulk) {
      if (newQty >= b.qty) {
        matchedTier = b;
      } else {
        break;
      }
    }

    if (matchedTier) {
      perPiece =
        matchedTier.price / Math.max(matchedTier.qty, 1);
    }
  }

  return perPiece;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: async (item) => {
        const user = useUserStore.getState().user;
        const accountOwnerId = getAccountOwnerId(user);

        if (!accountOwnerId) {
          console.error("User not logged in");
          return;
        }

        const resolved = await withResolvedTaxClass(item);

        const cartItem = resolved.item;

        const itemProdId = getProductId(cartItem);
        const itemVarId = getVariantId(cartItem);

        set((state) => {
          const gstPercent =
            resolved.taxRate || resolveTaxRate(cartItem);

          const existingIdx = state.cart.findIndex((el) => {
            const elProdId = getProductId(el);
            const elVarId = getVariantId(el);

            return (
              elProdId === itemProdId &&
              elVarId === itemVarId
            );
          });

          if (existingIdx !== -1) {
            const updated = [...state.cart];

            const old = updated[existingIdx];

            const newQty = old.qty + cartItem.qty;

            const perPiece = resolvePerPiece(
              cartItem,
              newQty
            );

            updated[existingIdx] = {
              ...old,
              product: cartItem.product ?? old.product,
              variant: cartItem.variant ?? old.variant,
              qty: newQty,
              price: perPiece,
              taxClass: gstPercent,
              paymentslip: buildSlip(
                perPiece,
                newQty,
                gstPercent
              ),
            };

            return {
              cart: updated,
            };
          }

          const perPiece = resolvePerPiece(
            cartItem,
            cartItem.qty
          );

          return {
            cart: [
              ...state.cart,
              {
                ...cartItem,
                price: perPiece,
                taxClass: gstPercent,
                paymentslip: buildSlip(
                  perPiece,
                  cartItem.qty,
                  gstPercent
                ),
              },
            ],
          };
        });

        try {
          await fetch(API_URL + "cart/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: accountOwnerId,
              product_id: itemProdId,
              variant_id: itemVarId,
              qty: cartItem.qty,
            }),
          });
        } catch (error) {
          console.error(
            "Failed to add to cart API:",
            error
          );
        }
      },

      syncCartTaxes: async () => {
        const cart = get().cart;

        const missingTaxItems = cart.filter(
          (item) =>
            resolveTaxRate(item) <= 0 &&
            getProductId(item)
        );

        if (missingTaxItems.length === 0) return;

        const taxByProductId = new Map<
          string,
          {
            product: Product;
            taxRate: number;
          }
        >();

        await Promise.all(
          missingTaxItems.map(async (item) => {
            const productId = getProductId(item);

            if (
              !productId ||
              taxByProductId.has(productId)
            ) {
              return;
            }

            try {
              const response = await fetch(
                API_URL + "product/get-product/" + productId
              );

              if (!response.ok) return;

              const product =
                (await response.json()) as Product;

              const taxRate = resolveTaxRate({
                ...item,
                product,
                taxClass: (product as any).taxClass,
              });

              if (taxRate > 0) {
                taxByProductId.set(productId, {
                  product,
                  taxRate,
                });
              }
            } catch (error) {
              console.error(
                "Failed to sync cart GST:",
                error
              );
            }
          })
        );

        if (taxByProductId.size === 0) return;

        set((state) => ({
          cart: state.cart.map((item) => {
            const productId = getProductId(item);

            const resolved = productId
              ? taxByProductId.get(productId)
              : null;

            if (!resolved) return item;

            const perPiece = resolvePerPiece(
              {
                ...item,
                product: resolved.product,
                taxClass: resolved.taxRate,
              },
              item.qty
            );

            return {
              ...item,
              product: resolved.product,
              taxClass: resolved.taxRate,
              price: perPiece,
              paymentslip: buildSlip(
                perPiece,
                item.qty,
                resolved.taxRate
              ),
            };
          }),
        }));
      },

      removeFromCart: async (
        productId,
        variantId
      ) => {
        const user = useUserStore.getState().user;

        const accountOwnerId =
          getAccountOwnerId(user);

        if (!accountOwnerId) {
          console.error("User not logged in");
          return;
        }

        try {
          await fetch(
            API_URL +
              `cart/${accountOwnerId}/${productId}/${variantId}`,
            {
              method: "DELETE",
            }
          );

          set((state) => ({
            cart: state.cart.filter((item) => {
              const elProdId = getProductId(item);
              const elVarId = getVariantId(item);

              return !(
                elProdId === productId &&
                elVarId === variantId
              );
            }),
          }));
        } catch (error) {
          console.error("Remove cart error:", error);
        }
      },

      changeQyt: (
        productId,
        variantId,
        amount
      ) =>
        set((state) => {
          const updated = state.cart
            .map((item) => {
              const elProdId = getProductId(item);

              const elVarId = getVariantId(item);

              if (
                elProdId === productId &&
                elVarId === variantId
              ) {
                const newQty = item.qty + amount;

                if (newQty <= 0) {
                  return null;
                }

                const perPiece = resolvePerPiece(
                  item,
                  newQty
                );

                return {
                  ...item,
                  qty: newQty,
                  price: perPiece,
                  paymentslip: buildSlip(
                    perPiece,
                    newQty,
                    item.taxClass ?? 0
                  ),
                };
              }

              return item;
            })
            .filter(
              (x): x is CartItem => x !== null
            );

          return {
            cart: updated,
          };
        }),

      clearCart: async () => {
        const user = useUserStore.getState().user;

        const accountOwnerId =
          getAccountOwnerId(user);

        if (!accountOwnerId) {
          console.error("User not logged in");
          return;
        }

        try {
          const response = await fetch(
            API_URL + `cart/clear/${accountOwnerId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => null);

            throw new Error(
              errorData?.message ||
                "Failed to clear cart"
            );
          }

          set({
            cart: [],
          });
        } catch (error) {
          console.error(
            "Clear Cart failed:",
            error
          );

          throw error;
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(
        () => localStorage
      ),
    }
  )
);