import { createBrowserRouter } from "react-router";
import RootLayout from "./components/Layouts/RootLayout";
// import ProductDetailsScreen from "./Screens/ProductDetailScreen/ProductDetailScreen";
import ProductDetails from "./Screens/ProductDetailScreen/ProductDetails";
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
import MyOrders from "./components/Order/MyOrders";
import PaymentScreen from "./Screens/Payment/PaymentScreen";
import AdminLogin from "./Screens/Admin/AdminLogin";
import OrderSummary from "./components/Order/OrderSummary";
import ManageAddress from "./components/Account/ManageAddress";
import WishlistProduct from "./components/Account/WishlistProduct";
import AccountNavbar from "./components/Account/AccountNavbar";
import AddToCart from "./components/Account/AddToCart";
import AllUserScreen from "./Screens/Admin/AllUserScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Consumables /> },
      { path: "product", element: <ProductsScreen /> },
      {
        path: "checkout",
        loader: checkoutScreenLoader,
        element: <CheckoutScreen />
      },
      {
        path: "checkout/payment",
        loader: checkoutScreenLoader,
        element: <PaymentScreen />
      },
      { path: "wishlist", element: <WishlistProduct /> },
      { path: "add-to-cart", element: <AddToCart /> },
    ],
  },

  {
    path: "/search",
    element: <SearchLayout />,
    children: [
      { index: true, element: <SearchResultsPage /> },
    ],
  },

  // Product details using a separate layout
  {
    path: "product/:id",
    element: <ProductLayout />,
    children: [
      { index: true, element: <ProductDetails /> },
    ],
  },

  // Consumables section
  {
    path: "/equipments",
    element: <RootLayout />,
    children: [
      { index: true, element: <Equipment /> },
      { path: "product", element: <ProductsScreen /> },
      {
        path: "product/:id",
        element: <ProductLayout />,
        children: [
          {
            index: true,
            element: <ProductDetails />,
          },
        ],
      },
      {
        path: "checkout",
        loader: checkoutScreenLoader,
        element: <CheckoutScreen />,
      },
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
        children: [{ index: true, element: <ProductDetails /> }]
      },
      {
        path: "checkout",
        loader: checkoutScreenLoader,
        element: <CheckoutScreen />
      },
    ],
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Consumables /> },
      { path: "product", element: <ProductsScreen /> },
      { path: "product/:id", element: <ProductDetails /> },
      { path: "checkout", loader: checkoutScreenLoader, element: <CheckoutScreen /> },
    ],
  },
  {
    path: "/pharmaceutical",
    element: <RootLayout />,
    children: [
      { index: true, element: <Pharmaceutical /> },
      { path: "product", element: <ProductsScreen /> },
      { path: "product/:id", element: <ProductDetails /> },
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
    path: "/admin-login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    loader: getAdminFromLocalLoader,
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "requests", element: <AdminRequestScreen />, },
      { path: "sellers", element: <AllSellerScreen />, },
       { path: "users", element: <AllUserScreen/> },
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

  {
    path: "/account",
    // loader: getAdminFromLocalLoader,
    element: <AccountLayout />,
    children: [
      { index: true, element: <MyProfile /> },
      { path: "address", element: <ManageAddress /> },
      { path: "wishlist", element: <WishlistProduct /> },

    ],
  },

  { path: "/user/activation/:token", element: <UserActivationScreen /> },
  { path: "/account", element: <AccountNavbar /> },
  { path: "/account/orders", element: <MyOrders /> },
  { path: "account/orders/:productId", element: <OrderSummary /> },

]); 
