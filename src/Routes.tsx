import { createBrowserRouter } from "react-router";
import RootLayout from "./components/Layouts/RootLayout";
import Homepage from "./Screens/Homepage/Homepage";
import ProductScreen from "./Screens/ProductScreen/ProductScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "/product/:id", element: <ProductScreen /> },
      { path: "*", element: <div>nina is hoe</div> },
    ],
  },
]);
