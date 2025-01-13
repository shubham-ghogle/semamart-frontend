import { createBrowserRouter } from "react-router";
import RootLayout from "./components/Layouts/RootLayout";
import Homepage from "./Screens/Homepage/Homepage";
import ProductDetailsScreen from "./Screens/ProductDetailScreen/ProductDetailScreen";
import LoginScreen from "./Screens/LoginScreen/LoginScreen";
import { getUserFromLocalLoader } from "./components/Login/Login.Hooks";
import AdminLayout from "./components/Layouts/AdminLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "/product/:id", element: <ProductDetailsScreen /> },
    ],
  },
  { path: "/login", loader: getUserFromLocalLoader, element: <LoginScreen /> },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [{ index: true, element: <div>admin index</div> }],
  },
]);
