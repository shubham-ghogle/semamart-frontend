// src/components/Seller/SellerLayout.tsx

import { Outlet } from "react-router-dom";
import SellerHeader from "../Seller/SellerHeader";
import SellerNavbar from "../Seller/SellerNavbar";


export default function SellerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader />

      <section className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 py-8">
        {/* Sidebar (SellerNavbar handles its own responsive drawer on small screens) */}
        <SellerNavbar />

        {/* Main content area */}
        <main className="min-h-[calc(100vh-120px)]">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
