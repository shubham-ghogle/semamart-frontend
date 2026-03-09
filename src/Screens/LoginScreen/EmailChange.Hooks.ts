import { API_URL } from "@/data";

type AccountType = "user" | "seller";

type ApiResponse = {
  success?: boolean;
  message?: string;
  user?: any;
  seller?: any;
};

export async function requestEmailChange(
  accountType: AccountType,
  newEmail: string
): Promise<ApiResponse> {
  const base = accountType === "seller" ? "shop" : "user";
  const res = await fetch(`${API_URL}${base}/request-email-change`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ newEmail }),
  });

  const data = (await res.json().catch(() => ({}))) as ApiResponse;
  if (!res.ok) throw new Error(data?.message || "Failed to request email change");
  return data;
}

export async function confirmEmailChange(
  accountType: AccountType,
  token: string
): Promise<ApiResponse> {
  const base = accountType === "seller" ? "shop" : "user";
  const res = await fetch(`${API_URL}${base}/confirm-email-change/${token}`);
  const data = (await res.json().catch(() => ({}))) as ApiResponse;
  if (!res.ok) throw new Error(data?.message || "Failed to confirm email change");
  return data;
}

