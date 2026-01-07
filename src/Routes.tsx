// src/router.tsx
import { createBrowserRouter, redirect } from "react-router";
import RootLayout from "./components/Layouts/RootLayout";
import ProductDetails from "./Screens/ProductDetailScreen/ProductDetails";
import LoginScreen from "./Screens/LoginScreen/LoginScreen";
import {
  getUserFromLocalLoader,
  protectSellerRoute,
  requireUserAuth,
} from "./Screens/LoginScreen/Login.Hooks";
import AdminLayout from "./components/Layouts/AdminLayout";
import AdminRequestScreen from "./Screens/Admin/AdminRequestScreen";
import AllSellerScreen from "./Screens/Admin/AllSellerScreen";
import { getAdminFromLocalLoader } from "./Screens/Admin/Admin.HooksAndUtils";
import SellerRegisterScreen from "./Screens/Register/SellerRegisterScreen";
import UserRegistrationScreen from "./Screens/Register/UserRegistrationScreen";
import SellerLayout from "./components/Layouts/SellerLayout";
import AddProductScreen2 from "./Screens/Seller/AddProductScreen2";
import UserActivationScreen from "./Screens/User/UserActivationScreen";
import ProductsScreen from "./Screens/Products/ProductsScreen";
import UserLayout from "./components/Layouts/UserLayout";
import AccountLayout from "./components/Layouts/AccountLayout";
import UserProfileScreen from "./Screens/User/UserProfileScreen";
import SellerDashboard from "./Screens/Seller/SellerDashboard";
import SellerAllProductsScreen from "./Screens/Seller/SellerAllProdutScreen";
import SellerAllOrders from "./Screens/Seller/SellerAllOrders";
import OrderDetailsScreen from "./Screens/Seller/OrderDetailsScreen";
import AdminDashboard from "./Screens/Admin/AdminDashboard";
import ViewProductScreen from "./Screens/Seller/ViewProductScreen";
import CheckoutScreen from "./Screens/CheckoutScreen/CheckoutScreen";
import UserAddressScreen from "./Screens/User/UserAddressScreen";
import UserOrdersScreen from "./Screens/User/UserOrdersScreen";
import UserOrderDetailsScreen from "./Screens/User/UserOrderDetailsScreen";
import Consumables from "./Screens/Consumables/Consumables";
import Pharmaceutical from "./Screens/Pharmaceutical/Pharamaceutical";
import Equipment from "./Screens/Equipment/Equipment";
import ProductLayout from "./components/Layouts/ProductLayout";
import SellerActivation from "./Screens/Seller/SellerActivation";
import SearchLayout from "./components/Layouts/SearchLayout";
import SearchResultsPage from "./Screens/Search/SearchResultsPage";
import MyProfile from "./components/Account/MyProfile";
import PaymentScreen from "./Screens/Payment/PaymentScreen";
import AdminLogin from "./Screens/Admin/AdminLogin";
import OrderSummary from "./components/Order/OrderSummary";
import ManageAddress from "./components/Account/ManageAddress";
import WishlistProduct from "./components/Account/WishlistProduct";
import AccountNavbar from "./components/Account/AccountNavbar";
import AddToCart from "./components/Account/AddToCart";
import ProductBasedOnType from "./components/ui/ProductBasedOnType";
import AllUserScreen from "./Screens/Admin/AllUserScreen";
import ProductBasedOnSpecialPackagetypes from "./components/ui/ProductBasedOnSpecialPackagetypes";
import ProductBasedOnSpecialPackage from "./components/ui/ProductBasedOnSpecialPackage";
import { requireSellerAuth } from "./Screens/Seller/Seller.Hooks";
import MyOrderPage from "./components/Account/Orderpage";
import AdminSellerProductScreen from "./Screens/Admin/AdminSellerProductScreen";
import ProductBasedOnCategory from "./components/ui/ProductBasedOnCategory";
import SellerAccount from "./components/Seller/SellerAccount";
import SellerProducts from "./Screens/SellerProducts/SellerProducts";
import SearchResultsPageSeller from "./Screens/SellerProducts/SearchResultsPageSeller";
import AllOrderScreen from "./Screens/Admin/AllOrderScreen";
import FooterLayout from "./components/Layouts/FooterLayout";
import About from "./components/Footer/About";
import CookiePolicy from "./components/Footer/CookiePolicy";
import DisclaimerPage from "./components/Footer/DisclaimerPage";
import ReturnsPolicy from "./components/Footer/ReturnPolicy";
import Shipping from "./components/Footer/Shipping";
import PrivacyPolicy from "./components/Footer/PrivacyPolicy";
import Term from "./components/Footer/Term";
import AdminProduct from "./components/Admin/AllProducts/AdminProducts";
import AdminOrderDetailsScreen from "./Screens/Admin/AdminOrderDetailsScreen";
import AdminSellerAccount from "./components/Admin/AdminSellerAccount";
import AdminImageUploader from "./components/Admin/AdminImageUploader";
import AdminUserAccount from "./components/Admin/AdminUserAccount";
import OrderProductCard from "./components/ui/OrderProductCard";
import UserWishlist from "./components/ui/UserWishlist";
import UserCart from "./components/ui/UserCart";
import AdminOrderSummary from "./components/ui/adminOrderSummary";
import BulkOrdersTable from "./components/Admin/BulkOrderTable";

/**
 * redirectToDashboard loader
 * - Checks localStorage keys used in your project:
 *   - "user-storage" (your Login.Hooks + admin loader use this)
 *   - "seller-storage" (seller login)
 *   - legacy "user" (older shapes)
 * - Priority: Admin -> Seller -> Regular User -> Public
 * - Writes sessionStorage debug info for quick inspection after redirect.
 */
function safeParse(s: string | null) {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function looksLikeSeller(obj: any) {
  if (!obj) return false;
  if (
    obj?.role &&
    typeof obj.role === "string" &&
    obj.role.toLowerCase() === "seller"
  )
    return true;
  if (obj?.seller && (obj.seller._id || obj.seller.email)) return true;
  if (obj?.state?.seller && (obj.state.seller._id || obj.state.seller.email))
    return true;
  // some stores store seller at root
  if (obj?._id && obj?.role && obj.role.toLowerCase?.() === "seller")
    return true;
  return false;
}

function looksLikeAdmin(obj: any) {
  if (!obj) return false;
  if (obj?.state?.user?.role === "Admin") return true; // exact parity with your admin loader
  if (
    obj?.role &&
    typeof obj.role === "string" &&
    obj.role.toLowerCase() === "admin"
  )
    return true;
  if (
    obj?.user?.role &&
    typeof obj.user.role === "string" &&
    obj.user.role.toLowerCase() === "admin"
  )
    return true;
  return false;
}

function looksLikeUser(obj: any) {
  if (!obj) return false;
  if (obj?._id || obj?.id || obj?.email) return true;
  if (obj?.user && (obj.user._id || obj.user.email)) return true;
  return false;
}

export async function redirectToDashboard() {
  try {
    // snapshot for debugging
    const allKeys = Object.keys(localStorage);
    sessionStorage.setItem(
      "__auth_all_localStorage_keys",
      JSON.stringify(allKeys),
    );

    // quick explicit checks (existing keys we know)
    const explicitKeys = ["user-storage", "seller-storage", "user"];
    for (const k of explicitKeys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = safeParse(raw);
      if (looksLikeAdmin(parsed)) {
        sessionStorage.setItem("__auth_result", "admin");
        sessionStorage.setItem("__auth_result_key", k);
        return redirect("/admin");
      }
      if (looksLikeSeller(parsed)) {
        sessionStorage.setItem("__auth_result", "seller");
        sessionStorage.setItem("__auth_result_key", k);
        return redirect("/seller");
      }
      if (looksLikeUser(parsed)) {
        sessionStorage.setItem("__auth_result", "user");
        sessionStorage.setItem("__auth_result_key", k);
        return redirect("/user");
      }
    }

    // fallback: scan all localStorage keys for something that looks like seller/admin/user
    for (const key of allKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = safeParse(raw);

      // If parsed is null (parse error) — some libraries store plain strings, check substring
      if (!parsed && typeof raw === "string") {
        const low = raw.toLowerCase();
        if (
          low.includes('"role":"admin"') ||
          low.includes('"role":"administrator"')
        ) {
          sessionStorage.setItem("__auth_result", "admin");
          sessionStorage.setItem("__auth_result_key", key);
          return redirect("/admin");
        }
        if (low.includes('"role":"seller"') || low.includes('"seller":')) {
          sessionStorage.setItem("__auth_result", "seller");
          sessionStorage.setItem("__auth_result_key", key);
          return redirect("/seller");
        }
        if (low.includes('"email"') || low.includes('"@')) {
          sessionStorage.setItem("__auth_result", "user");
          sessionStorage.setItem("__auth_result_key", key);
          return redirect("/user");
        }
      } else {
        // parsed object — test shapes
        if (looksLikeAdmin(parsed)) {
          sessionStorage.setItem("__auth_result", "admin");
          sessionStorage.setItem("__auth_result_key", key);
          return redirect("/admin");
        }
        if (looksLikeSeller(parsed)) {
          sessionStorage.setItem("__auth_result", "seller");
          sessionStorage.setItem("__auth_result_key", key);
          return redirect("/seller");
        }
        if (looksLikeUser(parsed)) {
          sessionStorage.setItem("__auth_result", "user");
          sessionStorage.setItem("__auth_result_key", key);
          return redirect("/user");
        }
      }
    }

    // nothing matched
    sessionStorage.setItem("__auth_result", "public");
    return null;
  } catch (err) {
    sessionStorage.setItem("__auth_result", "error");
    sessionStorage.setItem("__auth_result_error", String(err));
    return null;
  }
}

export const router = createBrowserRouter([
  {
    // SINGLE root route — every public page uses RootLayout
    path: "/",
    element: <RootLayout />,
    children: [
      // index: do NOT auto-redirect — always show public user portal
      { index: true, element: <Consumables /> },

      // public/product flows
      { path: "product", element: <ProductsScreen /> },
      { path: "product/:id", element: <ProductDetails /> },

      // protected checkout / wishlist
      {
        path: "checkout",
        loader: requireUserAuth,
        element: <CheckoutScreen />,
      },
      {
        path: "checkout/payment",
        loader: requireUserAuth,
        element: <PaymentScreen />,
      },
      {
        path: "wishlist",
        loader: requireUserAuth,
        element: <WishlistProduct />,
      },
      { path: "add-to-cart", loader: requireUserAuth, element: <AddToCart /> },
    ],
  },

  // All other routes remain the same (admin, seller, user, etc.)
  {
    path: "/search",
    element: <SearchLayout />,
    children: [{ index: true, element: <SearchResultsPage /> }],
  },

  {
    path: "product/:id",
    element: <ProductLayout />,
    children: [{ index: true, element: <ProductDetails /> }],
  },

  {
    path: "/equipments",
    element: <RootLayout />,
    children: [
      { index: true, element: <Equipment /> },
      { path: "product", element: <ProductsScreen /> },
      {
        path: "product/:id",
        element: <ProductLayout />,
        children: [{ index: true, element: <ProductDetails /> }],
      },
      {
        path: "checkout",
        loader: requireUserAuth,
        element: <CheckoutScreen />,
      },
    ],
  },

  {
    path: "/pharmaceutical",
    element: <RootLayout />,
    children: [
      { index: true, element: <Pharmaceutical /> },
      { path: "product", element: <ProductsScreen /> },
      {
        path: "product/:id",
        element: <ProductLayout />,
        children: [{ index: true, element: <ProductDetails /> }],
      },
      {
        path: "checkout",
        loader: requireUserAuth,
        element: <CheckoutScreen />,
      },
    ],
  },

  {
    path: "/shop/:shopId",
    element: <RootLayout />,
    children: [
      { index: true, element: <SellerProducts /> },
      { path: "search", element: <SearchResultsPageSeller /> },
    ],
  },

  { path: "/login", loader: getUserFromLocalLoader, element: <LoginScreen /> },
  { path: "/signup-seller", element: <SellerRegisterScreen /> },
  { path: "/signup", element: <UserRegistrationScreen /> },

  { path: "/admin-login", element: <AdminLogin /> },
  {
    path: "/admin",
    loader: getAdminFromLocalLoader,
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "requests", element: <AdminRequestScreen /> },
      { path: "img-upload", element: <AdminImageUploader /> },
      { path: "bulk-order-request", element: <BulkOrdersTable /> },
      {
        path: "sellers",
        children: [
          { index: true, element: <AllSellerScreen /> },
          {path: "profile/:sellerId", element:<AdminSellerAccount /> },
          {
            path: ":sellerId",
            children: [
              { index: true, element: <AdminSellerProductScreen /> },
              { path: "view/:id", element: <ViewProductScreen /> },
            ],
          },
        ],
      },
       {
          path: "users",
          children: [
            { index: true, element: <AllUserScreen /> },
             { path: "profile/:userId", element: <AdminUserAccount /> },
            { path: ":userId/products", element: <OrderProductCard /> },
            { path: "wishlist/:userId", element: <UserWishlist /> },
            { path: "cart/:userId", element: <UserCart/>},
            { path: "order/:orderId", element: <AdminOrderSummary/>},
          ],
        },
      { path: "products", element: <AdminProduct /> },
      {
        path: "orders",
        children: [
          { index: true, element: <AllOrderScreen /> },
          { path: ":orderId", element: <AdminOrderDetailsScreen /> },
        ],
      },
    ],
  },

  {
    path: "/seller",
    loader: requireSellerAuth,
    element: <SellerLayout />,
    children: [
      { index: true, element: <SellerDashboard /> },
      { path: "add-product", element: <AddProductScreen2 /> },
      { path: "my-account", element: <SellerAccount /> },
      {
        path: "products",
        children: [
          { index: true, element: <SellerAllProductsScreen /> },
          { path: "edit/:id", element: <ViewProductScreen /> },
          { path: "view/:id", element: <ProductLayout />,
            children: [{ index: true, element: <ProductDetails /> }],
          },
        ],
      },
      {
        path: "orders",
        children: [
          { index: true, element: <SellerAllOrders /> },
          { path: ":orderId", element: <OrderDetailsScreen /> },
        ],
      },
    ],
  },

  {
    path: "/user",
    loader: requireUserAuth,
    element: <UserLayout />,
    children: [
      { index: true, element: <UserProfileScreen /> },
      { path: "address", element: <UserAddressScreen /> },
      {
        path: "orders",
        children: [
          { index: true, element: <UserOrdersScreen /> },
          { path: ":orderId", element: <UserOrderDetailsScreen /> },
        ],
      },
    ],
  },

  {
    path: "/account",
    loader: requireUserAuth,
    element: <AccountLayout />,
    children: [
      { index: true, element: <MyProfile /> },
      { path: "address", element: <ManageAddress /> },
      { path: "wishlist", element: <WishlistProduct /> },
      { path: "orders", element: <MyOrderPage /> },
    ],
  },

  { path: "/user/activation/:token", element: <UserActivationScreen /> },
  {
    path: "/seller/activation/:activation_token",
    element: <SellerActivation />,
  },
  { path: "/account", element: <AccountNavbar /> },
  {
    path: "account/orders/:productId",
    loader: requireUserAuth,
    element: <OrderSummary />,
  },
  { path: "/get-products-by-subcategory/:id", element: <ProductBasedOnType /> },
  {
    path: "/get-products-by-speciality-package-type/:id",
    element: <ProductBasedOnSpecialPackagetypes />,
  },
  {
    path: "/get-products-by-speciality-package/:id",
    element: <ProductBasedOnSpecialPackage />,
  },

  { path: "*", element: <div>404 - Page Not Found</div> },

  {
    path: "/seller-account",
    loader: protectSellerRoute,
    element: <AccountLayout />,
    children: [{ index: true, element: <MyProfile /> }],
  },
  {
    path: "/get-products-by-category/:id",
    element: <ProductBasedOnCategory />,
  },

  {
    path: "/",
    element: <FooterLayout />, // Header + Footer
    children: [
      { path: "about", element: <About /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "cookie-policy", element: <CookiePolicy /> },
      { path: "refund-and-cancellation", element: <ReturnsPolicy /> },
      { path: "disclaimer", element: <DisclaimerPage /> },
      { path: "shipping-delivery-policy", element: <Shipping /> },
      { path: "terms-and-conditions", element: <Term /> },
    ],
  },

  {
    path: "/get-products-by-category/:id",
    element: <ProductBasedOnCategory />,
  },

  // Keep footer pages under their own path so they don't create a second root "/"
  {
    path: "/footer",
    element: <FooterLayout />,
    children: [
      { path: "about", element: <About /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "cookie-policy", element: <CookiePolicy /> },
      { path: "refund-and-cancellation", element: <ReturnsPolicy /> },
      { path: "disclaimer", element: <DisclaimerPage /> },
      { path: "shipping-delivery-policy", element: <Shipping /> },
      { path: "terms-and-conditions", element: <Term /> },
    ],
  },
]);
