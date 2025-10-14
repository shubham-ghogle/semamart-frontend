import { createBrowserRouter } from "react-router";
import RootLayout from "./components/Layouts/RootLayout";
import ProductDetails from "./Screens/ProductDetailScreen/ProductDetails";
import LoginScreen from "./Screens/LoginScreen/LoginScreen";
import { getUserFromLocalLoader, requireUserAuth } from "./Screens/LoginScreen/Login.Hooks";
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
import AdminProductRequestScreen from "./Screens/Admin/AdminProductScreen";
import ViewProductScreen from "./Screens/Seller/ViewProductScreen";
import CheckoutScreen from "./Screens/CheckoutScreen/CheckoutScreen";
import { checkoutScreenLoader } from "./Screens/CheckoutScreen/Checkout.HooksUtils";
import UserAddressScreen from "./Screens/User/UserAddressScreen";
import UserOrdersScreen from "./Screens/User/UserOrdersScreen";
import UserOrderDetailsScreen from "./Screens/User/UserOrderDetailsScreen";
import Consumables from "./Screens/Consumables/Consumables";
import Pharmaceutical from "./Screens/Pharmaceutical/Pharamaceutical";
import Equipment from "./Screens/Equipment/Equipment";
import ProductLayout from "./components/Layouts/ProductLayout";
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
import OrderPage from "./components/Layouts/OrderLayout";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Consumables /> },
      { path: "product", element: <ProductsScreen /> },
      {
        path: "checkout",
        loader: requireUserAuth, // 🔐 requires login
        element: <CheckoutScreen />,
      },
      {
        path: "checkout/payment",
        loader: requireUserAuth, // 🔐 requires login
        element: <PaymentScreen />,
      },
      { path: "wishlist", loader: requireUserAuth, element: <WishlistProduct /> }, // 🔐
      { path: "add-to-cart", loader: requireUserAuth, element: <AddToCart /> }, // 🔐
    ],
  },

  {
    path: "/search",
    element: <SearchLayout />,
    children: [{ index: true, element: <SearchResultsPage /> }],
  },

  // Product details layout
  {
    path: "product/:id",
    element: <ProductLayout />,
    children: [{ index: true, element: <ProductDetails /> }],
  },

  // Equipments section
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
      { path: "checkout", loader: requireUserAuth, element: <CheckoutScreen /> }, // 🔐
    ],
  },

  // Pharmaceutical section
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
      { path: "checkout", loader: requireUserAuth, element: <CheckoutScreen /> }, // 🔐
    ],
  },

  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Consumables /> },
      { path: "product", element: <ProductsScreen /> },
      { path: "product/:id", element: <ProductDetails /> },
      { path: "checkout", loader: requireUserAuth, element: <CheckoutScreen /> }, // 🔐
    ],
  },

  // Login & Registration routes
  { path: "/login", loader: getUserFromLocalLoader, element: <LoginScreen /> },
  { path: "/signup-seller", element: <SellerRegisterScreen /> },
  { path: "/signup", element: <UserRegistrationScreen /> },

  // Admin routes
  { path: "/admin-login", element: <AdminLogin /> },
  {
    path: "/admin",
    loader: getAdminFromLocalLoader,
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "requests", element: <AdminRequestScreen /> },
      { path: "sellers", element: <AllSellerScreen /> },
      { path: "users", element: <AllUserScreen /> },
      {
        path: "products",
        children: [
          { index: true, element: <AdminProductRequestScreen /> },
          { path: "view/:id", element: <ViewProductScreen /> },
        ],
      },
      { path: "*", element: <div>niniiii</div> },
    ],
  },

  // Seller routes
  {
    path: "/seller",
    element: <SellerLayout />,
    children: [
      { index: true, element: <SellerDashboard /> },
      { path: "add-product", element: <AddProductScreen2 /> },
      {
        path: "products",
        children: [
          { index: true, element: <SellerAllProductsScreen /> },
          { path: "view/:id", element: <ViewProductScreen /> },
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

  // User routes (🔐 protected)
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

  // Account routes (🔐 protected)
  {
    path: "/account",
    loader: requireUserAuth,
    element: <AccountLayout />,
    children: [
      { index: true, element: <MyProfile /> },
      { path: "address", element: <ManageAddress /> },
      { path: "wishlist", element: <WishlistProduct /> },
    ],
  },

  // Orders page (🔐 protected)
  { path: "/account/orders", loader: requireUserAuth, element: <OrderPage /> },

  // Other routes
  { path: "/user/activation/:token", element: <UserActivationScreen /> },
  { path: "/account", element: <AccountNavbar /> },
  { path: "account/orders/:productId", loader: requireUserAuth, element: <OrderSummary /> }, // 🔐
  { path: "/get-products-by-subcategory/:id", element: <ProductBasedOnType /> },
  { path: "/get-products-by-speciality-package-type/:id", element: <ProductBasedOnSpecialPackagetypes /> },
  { path: "/get-products-by-speciality-package/:id", element: <ProductBasedOnSpecialPackage /> },
]);
