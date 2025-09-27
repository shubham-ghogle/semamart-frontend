// utils.ts
export const PLACEHOLDER = "/placeholder.png";

export function toImageUrl(value?: string | null) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return value;
  return `/images/${value}`;
}
