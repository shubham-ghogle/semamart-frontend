// utils.ts
import { BASE_URL } from "@/data";

export const PLACEHOLDER = "/placeholder.png";

export function toImageUrl(value?: string | null) {
  if (!value) return undefined;
  const normalized = value.trim().replace(/^\/+/, "");
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
  if (normalized.startsWith("images/")) return `${BASE_URL}${normalized}`;
  return `${BASE_URL}images/${normalized}`;
}
