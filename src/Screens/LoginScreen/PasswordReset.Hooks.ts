import { API_URL } from "@/data";

type AccountType = "user" | "seller";

type ApiResponse = {
  success?: boolean;
  message?: string;
};

export async function requestPasswordReset(
  accountType: AccountType,
  email: string
): Promise<ApiResponse> {
  const base = accountType === "seller" ? "shop" : "user";
  const res = await fetch(`${API_URL}${base}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = (await res.json().catch(() => ({}))) as ApiResponse;
  if (!res.ok) throw new Error(data?.message || "Failed to request password reset");
  return data;
}

export async function resetPassword(
  accountType: AccountType,
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse> {
  const base = accountType === "seller" ? "shop" : "user";
  const res = await fetch(`${API_URL}${base}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  });

  const data = (await res.json().catch(() => ({}))) as ApiResponse;
  if (!res.ok) throw new Error(data?.message || "Failed to reset password");
  return data;
}

