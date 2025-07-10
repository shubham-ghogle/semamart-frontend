import { createBrowserRouter } from "react-router";
import RootLayout from "./components/Layouts/RootLayout";
import ProductDetailsScreen from "./Screens/ProductDetailScreen/ProductDetailScreen";
import LoginScreen from "./Screens/LoginScreen/LoginScreen";
import { getUserFromLocalLoader } from "./Screens/LoginScreen/Login.Hooks";
import AdminLayout from "./components/Layouts/AdminLayout";
import AdminRequestScreen from "./Screens/Admin/AdminRequestScreen";
import AllSellerScreen from "./Screens/Admin/AllSellerScreen";
// import AllOrderScreen from "./Screens/Admin/AllOrderScreen";

import { getAdminFromLocalLoader } from "./Screens/Admin/Admin.HooksAndUtils";
import SellerRegisterScreen from "./Screens/Register/SellerRegisterScreen";
import UserRegistrationScreen from "./Screens/Register/UserRegistrationScreen";
import SellerLayout from "./components/Layouts/SellerLayout";
import AddProductScreen2 from "./Screens/Seller/AddProductScreen2";
import UserActivationScreen from "./Screens/User/UserActivationScreen";
import ProductsScreen from "./Screens/Products/ProductsScreen";
import UserLayout from "./components/Layouts/UserLayout";
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

export const router = createBrowserRouter([
  {
    path: "/equipments",
    element: <RootLayout />,
    children: [
      { index: true, element: <Equipment/> },
      { path: "product", element: <ProductsScreen /> },
      { path: "product/:id", element: <ProductDetailsScreen /> },
      { path: "checkout", loader: checkoutScreenLoader, element: <CheckoutScreen /> },
    ],
  },
  {
    path: "/",
    element: <RootLayout/>,
    children: [
      { index: true, element: <Consumables/> },
      { path: "product", element: <ProductsScreen /> },
      { path: "product/:id", element: <ProductDetailsScreen /> },
      { path: "checkout", loader: checkoutScreenLoader, element: <CheckoutScreen /> },
    ],
  },
  {
    path: "/pharmaceutical",
    element: <RootLayout/>,
    children: [
      { index: true, element: <Pharmaceutical/> },
      { path: "product", element: <ProductsScreen /> },
      { path: "product/:id", element: <ProductDetailsScreen /> },
      { path: "checkout", loader: checkoutScreenLoader, element: <CheckoutScreen /> },
    ],
  },
  // Login routes
  {
    path: "/login",
    loader: getUserFromLocalLoader,
    element: <LoginScreen />,
  },
  // Registraion routes
  { path: "/signup-seller", element: <SellerRegisterScreen /> },
  { path: "/signup", element: <UserRegistrationScreen /> },
  // Admin Routes
  {
    path: "/admin",
    loader: getAdminFromLocalLoader,
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "requests", element: <AdminRequestScreen />, },
      { path: "sellers", element: <AllSellerScreen />, },
      {
        path: "products", children: [
          { index: true, element: <AdminProductRequestScreen /> },
          { path: "view/:id", element: <ViewProductScreen /> }
        ]
      },
      // {path: "orders", element: <AllOrderScreen />,
      { path: "*", element: <div>niniiii</div> },
    ],
  },
  // Seller Routes
  {
    path: "/seller",
    element: <SellerLayout />,
    children: [
      { index: true, element: <SellerDashboard /> },
      { path: "add-product", element: <AddProductScreen2 /> },
      {
        path: "products", children: [
          { index: true, element: <SellerAllProductsScreen /> },
          { path: "view/:id", element: <ViewProductScreen /> }
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
  // User Routes
  {
    path: "/user",
    // loader: getAdminFromLocalLoader,
    element: <UserLayout />,
    children: [
      { index: true, element: <UserProfileScreen /> },
      { path: "address", element: <UserAddressScreen /> },
      {
        path: "orders",
        children: [
          { index: true, element: <UserOrdersScreen /> },
          { path: ":orderId", element: <UserOrderDetailsScreen /> },
        ]
      },
    ],
  },
  { path: "/user/activation/:token", element: <UserActivationScreen /> },
  /////////
]);
