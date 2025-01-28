import { createBrowserRouter } from "react-router";
import RootLayout from "./components/Layouts/RootLayout";
import Homepage from "./Screens/Homepage/Homepage";
import ProductDetailsScreen from "./Screens/ProductDetailScreen/ProductDetailScreen";
import LoginScreen from "./Screens/LoginScreen/LoginScreen";
import { getUserFromLocalLoader } from "./Screens/LoginScreen/Login.Hooks";
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
import UserProfileScreen from "./Screens/User/UserProfileScreen";
import SellerDashboard from "./Screens/Seller/SellerDashboard";
import SellerAllProductsScreen from "./Screens/Seller/SellerAllProdutScreen";
import SellerAllOrders from "./Screens/Seller/SellerAllOrders";
import OrderDetailsScreen from "./Screens/Seller/OrderDetailsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "product", element: <ProductsScreen /> },
      { path: "product/:id", element: <ProductDetailsScreen /> },
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
      { index: true, element: <div>admin index</div> },
      {
        path: "requests",
        element: <AdminRequestScreen />,
      },
      {
        path: "sellers",
        element: <AllSellerScreen />,
      },
      {
        path: "users",
      },
      { path: "*", element: <div>hello</div> },
    ],
  },
  // Seller Routes
  {
    path: "/seller",
    element: <SellerLayout />,
    children: [
      { index: true, element: <SellerDashboard /> },
      { path: "add-product", element: <AddProductScreen2 /> },
      { path: "products", element: <SellerAllProductsScreen /> },
      {
        path: "orders", children: [
          { index: true, element: <SellerAllOrders /> },
          { path: ":orderId", element: <OrderDetailsScreen /> }
        ]
      }
    ],
  },
  // User Routes
  {
    path: "/user",
    loader: getAdminFromLocalLoader,
    element: <UserLayout />,
    children: [
      { index: true, element: <UserProfileScreen /> },
      { path: "activation/:token", element: <UserActivationScreen /> },
      { path: "nina", element: <div>hello</div> },
    ],
  },
]);
