import { createBrowserRouter } from "react-router";
import RootLayout from "./components/Layouts/RootLayout";
import Homepage from "./Screens/Homepage/Homepage";
import ProductDetailsScreen from "./Screens/ProductDetailScreen/ProductDetailScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "/product/:id", element: <ProductDetailsScreen /> },
      { path: "*", element: <div>YYYYYYYY</div> },
    ],
  },
  { path: "/nina", element: <div>this is nina</div> },
]);
