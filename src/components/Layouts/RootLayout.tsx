import { Outlet } from "react-router";
import Header from "../Header/Header";
import Navbar from "../Header/Navbar";

export default function RootLayout() {
  return (
    <>
      <Header />
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <footer>footer</footer>
    </>
  );
}
