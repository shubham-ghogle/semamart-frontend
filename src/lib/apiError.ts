export async function getApiErrorMessage(
  res: Response,
  fallback = "Something went wrong",
) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await res.json();
      return (
        data?.message ||
        data?.error ||
        data?.errors?.[0]?.message ||
        fallback
      );
    } catch {
      // Ignore JSON parse failures and try text below.
    }
  }

  try {
    const text = await res.text();
    const trimmed = text.trim();
    if (trimmed) return trimmed;
  } catch {
    // Ignore and fall back below.
  }

  return fallback;
}
