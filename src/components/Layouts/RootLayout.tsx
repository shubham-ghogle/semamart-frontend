import { Outlet } from "react-router";
import Header from "../Header/Header";
// import Navbar from "../Header/Navbar";
import Footer from "../Footer/Footer";
// import CategoryBar from "../Header/CategoryBar";

export default function RootLayout() {
  return (
    <>
      <Header />
      {/* <CategoryBar /> */}
      {/* <Navbar /> */}
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
