import type { User } from "@/Types/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAccountOwnerId(user?: User | null) {
  if (!user) return "";
  const parent = user.parentUser;
  if (parent && typeof parent === "object" && "_id" in parent && parent._id) {
    return parent._id;
  }
  if (typeof parent === "string" && parent) {
    return parent;
  }
  return user._id;
}

export function getAccountOwnerEmail(user?: User | null) {
  if (!user) return "";
  const parent = user.parentUser;
  if (parent && typeof parent === "object" && "email" in parent && parent.email) {
    return parent.email;
  }
  return user.email;
}

export function isSubAccount(user?: User | null) {
  return !!user?.parentUser;
}

function toFiniteNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getBulkTierCommission(source: any) {
  const variant =
    source?.variant && typeof source.variant === "object"
      ? source.variant
      : source;
  const qty = toFiniteNumber(source?.qty);

  if (!variant || qty === null || !Array.isArray(variant.bulkOrders)) {
    return null;
  }

  const matchedTier = [...variant.bulkOrders]
    .sort((a: any, b: any) => Number(a?.qty || 0) - Number(b?.qty || 0))
    .reduce((latest: any, tier: any) => {
      const tierQty = toFiniteNumber(tier?.qty);
      if (tierQty !== null && qty >= tierQty) {
        return tier;
      }
      return latest;
    }, null);

  const bulkCommission = toFiniteNumber(matchedTier?.commission);
  return bulkCommission !== null ? bulkCommission : null;
}

export function getVariantCommission(source: any) {
  if (!source) return 0;

  const direct = toFiniteNumber(source.commission);
  if (direct !== null) return direct;

  const bulkTierCommission = getBulkTierCommission(source);
  if (bulkTierCommission !== null) return bulkTierCommission;

  const variant =
    source.variant && typeof source.variant === "object"
      ? source.variant
      : source;

  const nestedVariant = toFiniteNumber(variant?.commission);
  if (nestedVariant !== null) return nestedVariant;

  const product =
    variant?.productId && typeof variant.productId === "object"
      ? variant.productId
      : source?.productId && typeof source.productId === "object"
        ? source.productId
        : null;

  const nestedProduct = toFiniteNumber(product?.commission);
  if (nestedProduct !== null) return nestedProduct;

  return 0;
}

export function isBulkOrder(source: any) {
  const variant =
    source?.variant && typeof source.variant === "object"
      ? source.variant
      : source?.variantId && typeof source.variantId === "object"
        ? source.variantId
        : source;
  const qty = toFiniteNumber(source?.qty);

  if (qty === null || !variant || !Array.isArray(variant.bulkOrders)) {
    return false;
  }

  return variant.bulkOrders.some((tier: any) => {
    const tierQty = toFiniteNumber(tier?.qty);
    return tierQty !== null && qty >= tierQty;
  });
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "").trim();
    if (message) return message;
  }

  return fallback;
}

function numberOrZero(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getCartLinePricing(item: any) {
  const qty = Math.max(1, numberOrZero(item?.qty) || 1);
  const taxRate = numberOrZero(item?.taxClass);
  const unitBase =
    numberOrZero(item?.paymentslip?.basePrice) ||
    numberOrZero(item?.price) ||
    numberOrZero(item?.variant?.discountPrice) ||
    numberOrZero(item?.variant?.originalPrice) ||
    numberOrZero(item?.product?.variants?.[0]?.discountPrice) ||
    numberOrZero(item?.product?.variants?.[0]?.originalPrice);

  const subtotal =
    numberOrZero(item?.paymentslip?.total) || unitBase * qty;
  const gstAmount =
    numberOrZero(item?.paymentslip?.gstAmount) || (subtotal * taxRate) / 100;
  const total =
    numberOrZero(item?.paymentslip?.grandTotal) || subtotal + gstAmount;

  return {
    qty,
    taxRate,
    unitBase,
    subtotal,
    gstAmount,
    total,
    gstPerUnit: qty > 0 ? gstAmount / qty : 0,
  };
}

export function getOrderLinePricing(order: any) {
  const qty = Math.max(1, numberOrZero(order?.qty) || 1);
  const taxRate = numberOrZero(order?.tax);
  const mrpPerUnit =
    numberOrZero(order?.unitPrice) ||
    numberOrZero(order?.variant?.originalPrice) ||
    numberOrZero(order?.variant?.discountPrice);
  const chargedPerUnit =
    numberOrZero(order?.discounted_amount) ||
    numberOrZero(order?.variant?.discountPrice) ||
    mrpPerUnit;

  const subtotal = chargedPerUnit * qty;
  const storedTaxAmount =
    numberOrZero(order?.cgst_amount) +
    numberOrZero(order?.sgst_amount) +
    numberOrZero(order?.igst_amount);
  const gstAmount =
    storedTaxAmount > 0
      ? storedTaxAmount
      : Math.max(0, numberOrZero(order?.totalPrice) - subtotal) || (subtotal * taxRate) / 100;
  const total = numberOrZero(order?.totalPrice) || subtotal + gstAmount;

  return {
    qty,
    taxRate,
    mrpPerUnit,
    chargedPerUnit,
    subtotal,
    gstAmount,
    total,
    gstPerUnit: qty > 0 ? gstAmount / qty : 0,
  };
}
