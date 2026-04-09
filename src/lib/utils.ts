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

export function getVariantCommission(source: any) {
  if (!source) return 0;

  const direct = toFiniteNumber(source.commission);
  if (direct !== null) return direct;

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
