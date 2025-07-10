import { Outlet } from "react-router";
import Header from "../Header/Header";
import ProductDetailsNavbar from "../Header/ProductDetailsNavbar";
import Footer from "../Footer/Footer";

export default function ProductLayout() {
  return (
    <>
      <Header />
       <ProductDetailsNavbar/>
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
