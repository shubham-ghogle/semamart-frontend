import { Outlet } from "react-router";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

export default function ProductLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
