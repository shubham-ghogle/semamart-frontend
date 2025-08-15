import { Outlet } from "react-router";
import Header from "../Header/Header";
import CategoryBar from "../Header/CategoryBar";
import Footer from "../Footer/Footer";

export default function ProductLayout() {
  return (
    <>
      <Header />
       <CategoryBar/>
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
