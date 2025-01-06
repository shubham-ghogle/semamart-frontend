import { Outlet } from "react-router";
import Header from "../Header/Header";
import Navbar from "../Header/Navbar";
import Footer from "../Footer/Footer";

export default function RootLayout() {
  return (
    <>
      <Header />
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
