import { BASE_URL, API_URL } from "@/data";
import { useUserStore } from "@/store/userStore";
import { useSellerStore } from "@/store/sellerStore";

export const SELLER_MEMBER_PERMISSION_KEYS = [
  "Dashboard",
  "MyAccount",
  "AddProduct",
  "AllProducts",
  "AllOrders",
  "CurrentOrderStatus",
  "AllSales",
  "Requests",
  "Support",
  "StockManagement",
  "ManageMembers",
  "MyShop",
] as const;

export type SellerMemberPermission = (typeof SELLER_MEMBER_PERMISSION_KEYS)[number];

export function isSellerMember(user?: any) {
  return Boolean(
    user &&
      (user.accountType === "seller-member" ||
        user.role === "SellerMember" ||
        user.role === "seller-member"),
  );
}

export function useSellerSession() {
  const seller = useSellerStore((state) => state.seller);
  const removeSeller = useSellerStore((state) => state.removeSeller);
  const user = useUserStore((state) => state.user);
  const removeUser = useUserStore((state) => state.removeUser);

  const memberMode = isSellerMember(user);
  const isOwner = Boolean(seller) && !memberMode;
  const permissions = memberMode ? user?.permissions || {} : {};
  const shopId = isOwner ? seller?._id || "" : user?.shopId || seller?._id || "";

  const canAccess = (permission: SellerMemberPermission) => {
    if (!memberMode) return true;
    if (permission === "Dashboard" || permission === "MyAccount") return true;
    if (permission === "ManageMembers") return false;
    return Boolean(permissions?.[permission]);
  };

  const displayName =
    memberMode
      ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Seller member"
      : seller?.businessName ||
        `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim() ||
        "Seller";

  const email = memberMode ? user?.email || "" : seller?.email || "";
  const avatar = memberMode
    ? user?.avatar
      ? `${BASE_URL}images/${user.avatar}`
      : "/image60.png"
    : seller?.profilePic
      ? `${BASE_URL}images/${seller.profilePic}`
      : seller?.avatar
        ? `${BASE_URL}images/${seller.avatar}`
        : "/image60.png";

  const logout = async () => {
    if (memberMode) {
      await fetch(API_URL + "user/logout", {
        method: "GET",
        credentials: "include",
      }).catch(() => null);
      removeUser();
      removeSeller();
      return;
    }

    await fetch(API_URL + "shop/logout", {
      method: "GET",
      credentials: "include",
    }).catch(() => null);

    removeSeller();
  };

  return {
    seller,
    user,
    memberMode,
    isOwner,
    shopId,
    permissions,
    displayName,
    email,
    avatar,
    canAccess,
    logout,
  };
}
