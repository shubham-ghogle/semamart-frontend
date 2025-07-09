import { Outlet } from "react-router";
import SellerHeader from "../Seller/SellerHeader";
import SellerNavbar from "../Seller/SellerNavbar";

export default function SellerLayout() {
  return (
    <>
      <SellerHeader />
      <section className="bg-bgGray">
        <div className="container mx-auto grid grid-cols-[250px_1fr] min-h-[calc(100vh-80px)]">
          <SellerNavbar />
          <main className="bg-bgGray">
            <Outlet />
          </main>
        </div>
      </section>
    </>
  );
}
