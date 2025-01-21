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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "product/:id", element: <ProductDetailsScreen /> },
    ],
  },
  {
    path: "/login",
    loader: getUserFromLocalLoader,
    element: <LoginScreen />,
  },
  { path: "/signup-seller", element: <SellerRegisterScreen /> },
  { path: "/signup", element: <UserRegistrationScreen /> },
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
      { path: "*", element: <div>niniiii</div> },
    ],
  },
  {
    path: "/seller",
    element: <SellerLayout />,
    children: [
      { index: true, element: <div>seller dashbaord</div> },
      { path: "add-product", element: <AddProductScreen2 /> },
    ],
  },
  {
    path: "/user",
    children: [
      { path: "activation/:token", element: <UserActivationScreen /> },
    ],
  },
]);
